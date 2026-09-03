// ---------------------------------------------------------------------------
//  Tests de LoudnessMeter
// ---------------------------------------------------------------------------
//  Ces tests n'ont besoin ni de micro, ni de scène, ni de lancer le jeu : ils
//  fabriquent des sons en calculant leurs échantillons, puis vérifient que la
//  mesure retombe sur la valeur que les mathématiques annoncent.
//
//  C'est exactement pour ça que SUAC.Voice.Core n'a pas le droit de référencer
//  UnityEngine : le calcul est isolé, donc vérifiable en quelques millisecondes.
//
//  Pour les lancer : fenêtre Window > General > Test Runner, onglet EditMode.
// ---------------------------------------------------------------------------

using System;
using NUnit.Framework;
using SUAC.Voice.Analysis;

namespace SUAC.Tests.Voice
{
    public sealed class LoudnessMeterTests
    {
        private const int SampleRate = 48000;
        private const int WindowSize = 1024;

        // ------------------------------------------------------------------
        //  Intensité
        // ------------------------------------------------------------------

        [Test]
        public void Rms_DUnSinusPleineEchelle_VautUnSurRacineDeDeux()
        {
            // Un sinus qui va de -1 à +1 a une valeur efficace de 1/√2 ≈ 0,707.
            // C'est un résultat mathématique exact, pas une approximation empirique :
            // si la mesure s'en écarte, c'est le code qui a tort.
            var window = new float[WindowSize];
            FillSine(window, frequencyHz: 440f, amplitude: 1f);

            RawLoudness measurement = LoudnessMeter.Measure(window);

            Assert.That(measurement.Rms, Is.EqualTo(0.7071f).Within(0.01f));
        }

        [Test]
        public void Peak_DUnSinusPleineEchelle_VautUn()
        {
            var window = new float[WindowSize];
            FillSine(window, frequencyHz: 440f, amplitude: 1f);

            RawLoudness measurement = LoudnessMeter.Measure(window);

            Assert.That(measurement.Peak, Is.EqualTo(1f).Within(0.01f));
        }

        [Test]
        public void Rms_EstProportionnelALAmplitude()
        {
            // Diviser l'amplitude par deux doit diviser le RMS par deux.
            // Ce test protège contre une erreur d'échelle qui passerait inaperçue
            // sur un seul volume.
            var loud = new float[WindowSize];
            var quiet = new float[WindowSize];
            FillSine(loud, 440f, amplitude: 1f);
            FillSine(quiet, 440f, amplitude: 0.5f);

            float loudRms = LoudnessMeter.Measure(loud).Rms;
            float quietRms = LoudnessMeter.Measure(quiet).Rms;

            Assert.That(quietRms, Is.EqualTo(loudRms / 2f).Within(0.01f));
        }

        [Test]
        public void Silence_DonneDesMesuresNulles()
        {
            var window = new float[WindowSize]; // un tableau neuf ne contient que des zéros

            RawLoudness measurement = LoudnessMeter.Measure(window);

            Assert.That(measurement.Rms, Is.EqualTo(0f));
            Assert.That(measurement.Peak, Is.EqualTo(0f));
        }

        [Test]
        public void FenetreVide_NeLevePasDException()
        {
            // Une capture qui vient de démarrer peut légitimement n'avoir aucun
            // échantillon à offrir. Ce n'est pas une erreur, c'est un cas normal.
            RawLoudness measurement = LoudnessMeter.Measure(ReadOnlySpan<float>.Empty);

            Assert.That(measurement.Rms, Is.EqualTo(0f));
            Assert.That(measurement.Peak, Is.EqualTo(0f));
        }

        // ------------------------------------------------------------------
        //  Facteur de crête — la forme du son
        // ------------------------------------------------------------------

        [Test]
        public void CrestFactor_DUnSinus_VautRacineDeDeux()
        {
            // Crête / RMS = 1 / (1/√2) = √2 ≈ 1,41.
            // C'est la référence basse : un son parfaitement régulier.
            var window = new float[WindowSize];
            FillSine(window, 440f, amplitude: 1f);

            float crest = LoudnessMeter.Measure(window).CrestFactor;

            Assert.That(crest, Is.EqualTo(1.414f).Within(0.05f));
        }

        [Test]
        public void CrestFactor_DUnClic_EstTresEleve()
        {
            // Un pic isolé dans du silence : la crête vaut 1, mais le RMS est écrasé
            // par les 1023 zéros qui l'entourent. C'est la signature d'un claquement
            // de langue, celui dont le Vase de l'Écho aura besoin.
            var window = new float[WindowSize];
            window[WindowSize / 2] = 1f;

            float crest = LoudnessMeter.Measure(window).CrestFactor;

            Assert.That(crest, Is.GreaterThan(10f));
        }

        [Test]
        public void CrestFactor_ClasseLesSonsDuPlusRegulierAuPlusPercussif()
        {
            // Le test qui compte vraiment pour le gameplay : peu importe les valeurs
            // exactes, c'est l'ORDRE qui doit tenir. Un sinus est plus régulier qu'un
            // bruit, qui est lui-même plus régulier qu'un clic.
            var sine = new float[WindowSize];
            var noise = new float[WindowSize];
            var click = new float[WindowSize];

            FillSine(sine, 440f, 1f);
            FillNoise(noise, seed: 12345);   // graine fixe = test reproductible
            click[WindowSize / 2] = 1f;

            float sineCrest = LoudnessMeter.Measure(sine).CrestFactor;
            float noiseCrest = LoudnessMeter.Measure(noise).CrestFactor;
            float clickCrest = LoudnessMeter.Measure(click).CrestFactor;

            Assert.That(sineCrest, Is.LessThan(noiseCrest), "Un sinus doit être plus régulier qu'un bruit.");
            Assert.That(noiseCrest, Is.LessThan(clickCrest), "Un bruit doit être plus régulier qu'un clic.");
        }

        // ------------------------------------------------------------------
        //  Allocations
        // ------------------------------------------------------------------

        [Test]
        public void Measure_NAllouePasUnSeulOctet()
        {
            // Cette méthode tourne une cinquantaine de fois par seconde et par joueur.
            // La moindre allocation finirait par déclencher le ramasse-miettes, et le
            // ramasse-miettes provoque des micro-saccades. On l'interdit, et on le vérifie.
            var window = new float[WindowSize];
            FillSine(window, 440f, 1f);

            // Premier appel « à blanc » : la toute première exécution d'une méthode
            // déclenche sa compilation à la volée, qui alloue. On ne veut pas la compter.
            LoudnessMeter.Measure(window);

            long before = GC.GetAllocatedBytesForCurrentThread();
            for (int i = 0; i < 10_000; i++)
            {
                LoudnessMeter.Measure(window);
            }
            long after = GC.GetAllocatedBytesForCurrentThread();

            Assert.That(after - before, Is.EqualTo(0L),
                "LoudnessMeter.Measure a alloué de la mémoire. Cherche une conversion implicite, " +
                "une capture de variable dans une lambda, ou un tableau créé dans la méthode.");
        }

        // ------------------------------------------------------------------
        //  Fabrication des signaux de test
        // ------------------------------------------------------------------

        /// <summary>
        /// Remplit le tableau d'un son pur — une oscillation parfaitement régulière.
        /// C'est le son le plus simple qui existe, et celui dont on connaît toutes
        /// les propriétés à l'avance.
        /// </summary>
        private static void FillSine(float[] buffer, float frequencyHz, float amplitude)
        {
            for (int i = 0; i < buffer.Length; i++)
            {
                double phase = 2.0 * Math.PI * frequencyHz * i / SampleRate;
                buffer[i] = (float)(Math.Sin(phase) * amplitude);
            }
        }

        /// <summary>
        /// Remplit le tableau de bruit. La graine est fixe pour que le test donne
        /// toujours le même résultat — un test qui échoue une fois sur dix ne sert à rien.
        /// </summary>
        private static void FillNoise(float[] buffer, int seed)
        {
            var random = new Random(seed);
            for (int i = 0; i < buffer.Length; i++)
            {
                buffer[i] = (float)(random.NextDouble() * 2.0 - 1.0);
            }
        }
    }
}
