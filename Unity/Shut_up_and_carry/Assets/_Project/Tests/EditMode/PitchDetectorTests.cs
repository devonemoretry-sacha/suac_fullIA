// ---------------------------------------------------------------------------
//  Tests de PitchDetector
// ---------------------------------------------------------------------------
//  Le détecteur travaille sur du son déjà décimé, donc ces tests fabriquent des
//  signaux à 8 kHz et les lui donnent directement. Ça l'isole du décimateur : si un
//  test échoue, on sait lequel des deux est en cause.
//
//  Les écarts de hauteur sont exprimés en CENTS plutôt qu'en hertz. Un cent est un
//  centième de demi-ton, et c'est la bonne unité pour juger une erreur de hauteur :
//  10 Hz d'erreur sont énormes sur une note grave et inaudibles sur un aigu, alors
//  que 20 cents sont 20 cents partout.
// ---------------------------------------------------------------------------

using System;
using NUnit.Framework;
using SUAC.Voice.Analysis;

namespace SUAC.Tests.Voice
{
    public sealed class PitchDetectorTests
    {
        private const float DecimatedRate = 8000f;
        private const float MinHz = 70f;
        private const float MaxHz = 600f;
        private const float Threshold = 0.15f;
        private const int WindowSize = 256;

        private static PitchDetector CreateDetector() =>
            new PitchDetector(DecimatedRate, MinHz, MaxHz, Threshold, WindowSize);

        // ------------------------------------------------------------------
        //  Justesse
        // ------------------------------------------------------------------

        [TestCase(110f)]
        [TestCase(220f)]
        [TestCase(440f)]
        public void UnSonPur_EstDetecteALaBonneHauteur(float frequency)
        {
            PitchDetector detector = CreateDetector();
            float[] buffer = MakeSine(detector.RequiredSampleCount, frequency);

            RawPitch pitch = detector.Detect(buffer);

            Assert.That(pitch.IsVoiced, Is.True, "Un son pur doit être reconnu comme voisé.");
            AssertCents(pitch.F0Hz, frequency, toleranceCents: 20f);
        }

        [Test]
        public void UneHauteurEntreDeuxDecalagesEntiers_EstQuandMemeJuste()
        {
            // 213,33 Hz correspond à un décalage de 37,5 échantillons — pile entre deux
            // valeurs entières. Sans l'interpolation parabolique, la réponse tomberait sur
            // 216,2 Hz ou 210,5 Hz, soit plus de 20 cents d'erreur. Ce test échoue si
            // l'étape 4 de YIN est retirée.
            PitchDetector detector = CreateDetector();
            const float frequency = 8000f / 37.5f;
            float[] buffer = MakeSine(detector.RequiredSampleCount, frequency);

            RawPitch pitch = detector.Detect(buffer);

            Assert.That(pitch.IsVoiced, Is.True);
            AssertCents(pitch.F0Hz, frequency, toleranceCents: 20f);
        }

        [Test]
        public void LaHauteurNeDependPasDuVolume()
        {
            // Deux joueurs qui chantent la même note à des volumes différents doivent
            // obtenir la même hauteur, sinon l'équité vocale part de travers dès la mesure.
            PitchDetector detector = CreateDetector();
            float[] loud = MakeSine(detector.RequiredSampleCount, 180f, amplitude: 1.0f);
            float[] quiet = MakeSine(detector.RequiredSampleCount, 180f, amplitude: 0.05f);

            float loudPitch = detector.Detect(loud).F0Hz;
            float quietPitch = detector.Detect(quiet).F0Hz;

            AssertCents(quietPitch, loudPitch, toleranceCents: 5f);
        }

        // ------------------------------------------------------------------
        //  Erreurs d'octave — le vrai enjeu
        // ------------------------------------------------------------------

        [Test]
        public void UnSonRicheEnHarmoniques_DonneLaFondamentaleEtPasSonOctave()
        {
            // Une voix n'est pas un son pur : c'est une fondamentale accompagnée de ses
            // multiples. Le piège classique est de répondre 300 Hz (l'octave au-dessus)
            // ou 75 Hz (celle du dessous) au lieu de 150.
            PitchDetector detector = CreateDetector();
            float[] buffer = MakeHarmonicTone(
                detector.RequiredSampleCount,
                fundamental: 150f,
                harmonicAmplitudes: new[] { 1.0f, 0.6f, 0.4f, 0.25f, 0.15f });

            RawPitch pitch = detector.Detect(buffer);

            Assert.That(pitch.IsVoiced, Is.True);
            AssertCents(pitch.F0Hz, 150f, toleranceCents: 25f);
        }

        [Test]
        public void UneFondamentaleAbsente_EstQuandMemeTrouvee()
        {
            // Le piège à octave le plus dur. Le signal ne contient QUE 300, 450 et 600 Hz :
            // la fondamentale à 150 Hz n'y est physiquement pas. Pourtant le motif se répète
            // 150 fois par seconde, et l'oreille humaine entend bien 150. YIN travaillant sur
            // la répétition du motif et non sur les fréquences présentes, il doit répondre 150.
            //
            // Un détecteur naïf qui chercherait « la plus basse fréquence présente »
            // répondrait 300 — soit une octave trop haut.
            PitchDetector detector = CreateDetector();
            float[] buffer = MakeMissingFundamental(detector.RequiredSampleCount, fundamental: 150f);

            RawPitch pitch = detector.Detect(buffer);

            Assert.That(pitch.IsVoiced, Is.True);
            AssertCents(pitch.F0Hz, 150f, toleranceCents: 25f);
        }

        // ------------------------------------------------------------------
        //  Sons sans hauteur
        // ------------------------------------------------------------------

        [Test]
        public void DuBruitBlanc_NEstPasVoise()
        {
            // Le bruit ne se répète jamais : il n'a pas de hauteur. C'est le comportement
            // qu'on retrouvera sur un « ssss », un « chhh » ou un chuchotement — et c'est
            // ce qui permettra aux objets sensibles à la hauteur de les ignorer, au lieu
            // de s'affoler à chaque consonne.
            PitchDetector detector = CreateDetector();
            float[] buffer = MakeNoise(detector.RequiredSampleCount, seed: 4242);

            RawPitch pitch = detector.Detect(buffer);

            Assert.That(pitch.IsVoiced, Is.False, "Du bruit ne doit jamais passer pour une note.");
            Assert.That(pitch.F0Hz, Is.EqualTo(0f), "Un son non voisé ne doit exposer aucune hauteur.");
        }

        [Test]
        public void LeSilence_NEstPasVoise()
        {
            PitchDetector detector = CreateDetector();
            var buffer = new float[detector.RequiredSampleCount];

            RawPitch pitch = detector.Detect(buffer);

            Assert.That(pitch.IsVoiced, Is.False);
            Assert.That(pitch.F0Hz, Is.EqualTo(0f));
        }

        [Test]
        public void PasAssezDEchantillons_NeDeclencheAucuneDevinette()
        {
            PitchDetector detector = CreateDetector();
            var tooShort = new float[detector.RequiredSampleCount - 1];

            RawPitch pitch = detector.Detect(tooShort);

            Assert.That(pitch.IsVoiced, Is.False);
        }

        // ------------------------------------------------------------------
        //  Chaîne complète : décimation puis détection
        // ------------------------------------------------------------------

        [Test]
        public void UnAiguReplie_EstQuasiEfface_MaisResteJugePeriodique()
        {
            // CE TEST DOCUMENTE UNE LIMITE DE L'ALGORITHME, PAS UN DÉFAUT DU CODE.
            //
            // Un sifflement à 7 900 Hz est exactement ce qui se replierait à 100 Hz si on
            // décimait sans filtrer. Le filtre fait très bien son travail : il en retire plus
            // de 60 dB, il n'en reste qu'un résidu inaudible.
            //
            // Et pourtant YIN le déclare voisé, à 100 Hz, avec une confiance totale.
            // Ce n'est pas une erreur : YIN est AVEUGLE AU VOLUME par construction. Sa
            // normalisation compare le signal à lui-même, si bien qu'un résidu minuscule mais
            // parfaitement régulier reste parfaitement régulier. Aucun filtre, si raide
            // soit-il, ne changera cela — il ne fera que rendre le résidu plus discret.
            //
            // CONSÉQUENCE POUR L'ARCHITECTURE : l'apériodicité ne suffit pas à décider du
            // voisement. Il faut AUSSI que le son soit assez fort pour compter. Cette porte
            // de volume appartient au VoiceAnalyzer, pas à cette classe : son seuil dépend du
            // profil calibré du joueur, que le détecteur de hauteur ne connaît pas — et ne
            // doit pas connaître.
            //
            // Sans cette porte, le ronronnement d'un frigo ou d'un ventilateur serait entendu
            // comme une note franche pendant les silences, et le Matelas à Mémoire de Ton
            // réagirait au frigo.
            //
            // Si ce test se met un jour à échouer parce que le voisement devient faux, c'est
            // sans doute qu'une porte de volume a été ajoutée ici. Vérifie que c'est voulu.
            var decimator = new Decimator(factor: 6, inputSampleRate: 48000f, cutoffHz: 3200f, tapCount: 81);
            PitchDetector detector = CreateDetector();

            float[] input = MakeSine(48000, 7900f, sampleRate: 48000f);
            var decimated = new float[input.Length / 6 + 1];
            int produced = decimator.Process(input, decimated);

            // Premier fait : le filtre a bien écrasé l'aigu.
            int warmUp = 100;
            double residual = 0.0;
            for (int i = warmUp; i < produced; i++)
            {
                residual += (double)decimated[i] * decimated[i];
            }
            float residualRms = (float)Math.Sqrt(residual / (produced - warmUp));
            const float inputRms = 0.7071f;   // valeur efficace d'un sinus pleine échelle

            Assert.That(residualRms, Is.LessThan(inputRms * 0.001f),
                "Le filtre de décimation doit atténuer l'aigu d'au moins 60 dB.");

            // Second fait : ce qu'il en reste passe quand même pour une note.
            var window = new ReadOnlySpan<float>(decimated, produced - detector.RequiredSampleCount,
                                                 detector.RequiredSampleCount);
            RawPitch pitch = detector.Detect(window);

            Assert.That(pitch.IsVoiced, Is.True,
                "YIN ne regarde pas le volume : c'est pour cela que le VoiceAnalyzer devra " +
                "ajouter une porte de volume avant de faire confiance à la hauteur.");
        }

        [Test]
        public void UneVoixGrave_TraverseLaDecimationSansPerdreSaHauteur()
        {
            // Le pendant du test précédent : ce qui doit passer, passe.
            var decimator = new Decimator(factor: 6, inputSampleRate: 48000f, cutoffHz: 3200f, tapCount: 81);
            PitchDetector detector = CreateDetector();

            const float frequency = 130f;
            float[] input = MakeSine(48000, frequency, sampleRate: 48000f);
            var decimated = new float[input.Length / 6 + 1];
            int produced = decimator.Process(input, decimated);

            var window = new ReadOnlySpan<float>(decimated, produced - detector.RequiredSampleCount,
                                                 detector.RequiredSampleCount);
            RawPitch pitch = detector.Detect(window);

            Assert.That(pitch.IsVoiced, Is.True);
            AssertCents(pitch.F0Hz, frequency, toleranceCents: 20f);
        }

        // ------------------------------------------------------------------
        //  Allocations
        // ------------------------------------------------------------------

        [Test]
        public void Detect_NAllouePasUnSeulOctet()
        {
            PitchDetector detector = CreateDetector();
            float[] buffer = MakeSine(detector.RequiredSampleCount, 200f);
            detector.Detect(buffer);   // appel à blanc, pour ne pas compter la compilation

            long before = GC.GetAllocatedBytesForCurrentThread();
            for (int i = 0; i < 1_000; i++)
            {
                detector.Detect(buffer);
            }
            long after = GC.GetAllocatedBytesForCurrentThread();

            Assert.That(after - before, Is.EqualTo(0L),
                "PitchDetector.Detect a alloué : les tampons doivent tous naître au constructeur.");
        }

        // ------------------------------------------------------------------
        //  Outils
        // ------------------------------------------------------------------

        /// <summary>
        /// Compare deux hauteurs en cents (centièmes de demi-ton), l'unité qui rend un
        /// écart comparable dans le grave et dans l'aigu.
        /// </summary>
        private static void AssertCents(float measuredHz, float expectedHz, float toleranceCents)
        {
            Assert.That(measuredHz, Is.GreaterThan(0f), "Aucune hauteur mesurée.");

            double cents = 1200.0 * Math.Log(measuredHz / expectedHz, 2.0);

            Assert.That(Math.Abs(cents), Is.LessThanOrEqualTo(toleranceCents),
                $"Attendu {expectedHz:0.0} Hz, mesuré {measuredHz:0.0} Hz, soit {cents:+0.0;-0.0} cents d'écart.");
        }

        private static float[] MakeSine(int length, float frequencyHz, float amplitude = 1f,
                                        float sampleRate = DecimatedRate)
        {
            var buffer = new float[length];
            for (int i = 0; i < length; i++)
            {
                buffer[i] = (float)(Math.Sin(2.0 * Math.PI * frequencyHz * i / sampleRate) * amplitude);
            }
            return buffer;
        }

        /// <summary>
        /// Fabrique un son « à la voix » : une fondamentale et ses multiples entiers,
        /// d'amplitudes décroissantes.
        /// </summary>
        private static float[] MakeHarmonicTone(int length, float fundamental, float[] harmonicAmplitudes)
        {
            var buffer = new float[length];
            for (int i = 0; i < length; i++)
            {
                double sum = 0.0;
                for (int h = 0; h < harmonicAmplitudes.Length; h++)
                {
                    double frequency = fundamental * (h + 1);
                    sum += Math.Sin(2.0 * Math.PI * frequency * i / DecimatedRate) * harmonicAmplitudes[h];
                }
                buffer[i] = (float)(sum / harmonicAmplitudes.Length);
            }
            return buffer;
        }

        /// <summary>
        /// Fabrique un son dont la fondamentale est absente : seuls les harmoniques 2, 3 et 4
        /// sont présents. Le motif se répète malgré tout à la fréquence de la fondamentale.
        /// </summary>
        private static float[] MakeMissingFundamental(int length, float fundamental)
        {
            var buffer = new float[length];
            for (int i = 0; i < length; i++)
            {
                double sum = 0.0;
                for (int h = 2; h <= 4; h++)
                {
                    sum += Math.Sin(2.0 * Math.PI * fundamental * h * i / DecimatedRate);
                }
                buffer[i] = (float)(sum / 3.0);
            }
            return buffer;
        }

        private static float[] MakeNoise(int length, int seed)
        {
            var random = new Random(seed);
            var buffer = new float[length];
            for (int i = 0; i < length; i++)
            {
                buffer[i] = (float)(random.NextDouble() * 2.0 - 1.0);
            }
            return buffer;
        }
    }
}
