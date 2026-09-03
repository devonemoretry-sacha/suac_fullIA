// ---------------------------------------------------------------------------
//  Tests d'EnvelopeFollower
// ---------------------------------------------------------------------------
//  Un filtre de lissage se vérifie sur sa réponse à un « échelon » : on lui envoie
//  brutalement une valeur constante et on regarde comment il la rejoint.
// ---------------------------------------------------------------------------

using System;
using NUnit.Framework;
using SUAC.Voice.Analysis;

namespace SUAC.Tests.Voice
{
    public sealed class EnvelopeFollowerTests
    {
        private const float UpdateRateHz = 50f;

        [Test]
        public void ApresUneConstanteDeTemps_LeFiltreAParcouru63PourcentDuChemin()
        {
            // C'est la définition même d'une constante de temps, et donc la propriété
            // qui prouve que la conversion durée → coefficient est correcte.
            // Avec 0,1 s à 50 appels/s, il faut 5 appels pour y être.
            const float timeConstant = 0.1f;
            var follower = new EnvelopeFollower(timeConstant, timeConstant, UpdateRateHz);

            int steps = (int)(timeConstant * UpdateRateHz);
            for (int i = 0; i < steps; i++)
            {
                follower.Process(1f);
            }

            Assert.That(follower.Value, Is.EqualTo(0.632f).Within(0.02f));
        }

        [Test]
        public void LaMonteeEstPlusRapideQueLaDescente()
        {
            // Le comportement qu'on veut dans le jeu : un cri se sent tout de suite,
            // mais le silence qui suit ne fait pas retomber le meuble d'un coup.
            var follower = new EnvelopeFollower(
                attackSeconds: 0.02f,   // rapide
                releaseSeconds: 0.30f,  // lent
                UpdateRateHz);

            // Cinq appels pour monter depuis zéro...
            for (int i = 0; i < 5; i++)
            {
                follower.Process(1f);
            }
            float afterRise = follower.Value;

            // ...puis cinq appels pour redescendre vers zéro.
            for (int i = 0; i < 5; i++)
            {
                follower.Process(0f);
            }
            float afterFall = follower.Value;

            float rise = afterRise;                 // distance parcourue vers le haut
            float fall = afterRise - afterFall;     // distance parcourue vers le bas

            Assert.That(rise, Is.GreaterThan(fall),
                "À nombre d'appels égal, la montée doit couvrir plus de chemin que la descente.");
        }

        [Test]
        public void UneConstanteDeTempsNulle_SuitLEntreeInstantanement()
        {
            var follower = new EnvelopeFollower(0f, 0f, UpdateRateHz);

            follower.Process(0.42f);

            Assert.That(follower.Value, Is.EqualTo(0.42f).Within(0.0001f));
        }

        [Test]
        public void LaValeurNeDepasseJamaisLaCible()
        {
            // Un filtre du premier ordre s'approche de sa cible sans jamais la dépasser.
            // Un dépassement signalerait une erreur de signe dans la formule — et en jeu,
            // un meuble momentanément plus lourd que le cri qui l'a déclenché.
            var follower = new EnvelopeFollower(0.05f, 0.05f, UpdateRateHz);

            for (int i = 0; i < 500; i++)
            {
                float value = follower.Process(1f);
                Assert.That(value, Is.LessThanOrEqualTo(1f));
            }
        }

        [Test]
        public void Reset_RameneLeFiltreALaValeurDemandee()
        {
            var follower = new EnvelopeFollower(0.1f, 0.1f, UpdateRateHz);
            for (int i = 0; i < 20; i++)
            {
                follower.Process(1f);
            }

            follower.Reset();

            Assert.That(follower.Value, Is.EqualTo(0f));
        }

        [Test]
        public void UneCadenceInvalide_EstRefuseeALaConstruction()
        {
            // Mieux vaut échouer bruyamment au démarrage qu'appliquer silencieusement
            // un lissage aberrant pendant toute la partie.
            Assert.Throws<ArgumentOutOfRangeException>(() => new EnvelopeFollower(0.1f, 0.1f, 0f));
            Assert.Throws<ArgumentOutOfRangeException>(() => new EnvelopeFollower(-1f, 0.1f, UpdateRateHz));
            Assert.Throws<ArgumentOutOfRangeException>(() => new EnvelopeFollower(0.1f, -1f, UpdateRateHz));
        }

        [Test]
        public void Process_NAllouePasUnSeulOctet()
        {
            var follower = new EnvelopeFollower(0.02f, 0.3f, UpdateRateHz);
            follower.Process(1f); // appel à blanc, pour ne pas compter la compilation à la volée

            long before = GC.GetAllocatedBytesForCurrentThread();
            for (int i = 0; i < 10_000; i++)
            {
                follower.Process(i % 2 == 0 ? 1f : 0f);
            }
            long after = GC.GetAllocatedBytesForCurrentThread();

            Assert.That(after - before, Is.EqualTo(0L));
        }
    }
}
