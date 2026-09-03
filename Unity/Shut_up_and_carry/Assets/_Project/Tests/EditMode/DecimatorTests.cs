// ---------------------------------------------------------------------------
//  Tests de Decimator
// ---------------------------------------------------------------------------
//  Un décimateur a deux devoirs, et ils se contredisent : laisser passer le grave
//  intact, et supprimer l'aigu complètement. Ces tests vérifient les deux, plus la
//  continuité entre appels successifs.
// ---------------------------------------------------------------------------

using System;
using NUnit.Framework;
using SUAC.Voice.Analysis;

namespace SUAC.Tests.Voice
{
    public sealed class DecimatorTests
    {
        private const float InputRate = 48000f;
        private const int Factor = 6;
        private const float CutoffHz = 3200f;
        private const int TapCount = 81;

        private static Decimator CreateDecimator() =>
            new Decimator(Factor, InputRate, CutoffHz, TapCount);

        [Test]
        public void ProduitUnEchantillonSurSix()
        {
            Decimator decimator = CreateDecimator();
            var input = new float[6000];
            var output = new float[input.Length / Factor + 1];

            int produced = decimator.Process(input, output);

            Assert.That(produced, Is.EqualTo(1000));
        }

        [Test]
        public void UnGrave_TraverseSansPerdreDeNiveau()
        {
            // 200 Hz est très en dessous de la coupure : le filtre ne doit presque rien
            // lui prendre. On compare les valeurs efficaces avant et après.
            Decimator decimator = CreateDecimator();
            float[] input = MakeSine(48000, 200f);
            var output = new float[input.Length / Factor + 1];

            int produced = decimator.Process(input, output);

            // On ignore le début, le temps que la ligne à retard se remplisse.
            int warmUp = TapCount / Factor + 1;
            float inputRms = Rms(input, input.Length / 2, 4000);
            float outputRms = Rms(output, warmUp, produced - warmUp);

            Assert.That(outputRms, Is.EqualTo(inputRms).Within(0.05f),
                "Une fréquence bien en dessous de la coupure doit traverser sans atténuation notable.");
        }

        [Test]
        public void UnAigu_EstFortementAttenue()
        {
            // 7 900 Hz est ce qui se replierait à 100 Hz sans filtre — le pire cas.
            // Il doit disparaître, pas se transformer en note grave.
            Decimator decimator = CreateDecimator();
            float[] input = MakeSine(48000, 7900f);
            var output = new float[input.Length / Factor + 1];

            int produced = decimator.Process(input, output);

            int warmUp = TapCount / Factor + 1;
            float inputRms = Rms(input, input.Length / 2, 4000);
            float outputRms = Rms(output, warmUp, produced - warmUp);

            // Un centième du niveau d'entrée, soit -40 dB au moins.
            Assert.That(outputRms, Is.LessThan(inputRms * 0.01f),
                $"L'aigu n'est pas assez atténué (entrée {inputRms:0.000}, sortie {outputRms:0.000}). " +
                "Sans cette atténuation, il se replierait en fausse note grave.");
        }

        [Test]
        public void DecouperLEntreeEnMorceaux_DonneLeMemeResultat()
        {
            // La mémoire interne doit assurer la continuité : traiter 1 200 échantillons
            // d'un coup ou en douze fois cent doit produire exactement la même sortie.
            // Sans cette propriété, chaque appel créerait une rupture audible.
            float[] input = MakeSine(1200, 300f);

            Decimator wholeDecimator = CreateDecimator();
            var wholeOutput = new float[input.Length / Factor + 1];
            int wholeCount = wholeDecimator.Process(input, wholeOutput);

            Decimator chunkedDecimator = CreateDecimator();
            var chunkedOutput = new float[input.Length / Factor + 1];
            int chunkedCount = 0;
            for (int offset = 0; offset < input.Length; offset += 100)
            {
                var chunk = new ReadOnlySpan<float>(input, offset, 100);
                var destination = new Span<float>(chunkedOutput, chunkedCount, chunkedOutput.Length - chunkedCount);
                chunkedCount += chunkedDecimator.Process(chunk, destination);
            }

            Assert.That(chunkedCount, Is.EqualTo(wholeCount));
            for (int i = 0; i < wholeCount; i++)
            {
                Assert.That(chunkedOutput[i], Is.EqualTo(wholeOutput[i]).Within(1e-6f),
                    $"Divergence à l'échantillon {i} : la continuité entre appels est rompue.");
            }
        }

        [Test]
        public void Reset_EffaceLaMemoire()
        {
            Decimator decimator = CreateDecimator();
            float[] input = MakeSine(1200, 300f);
            var output = new float[input.Length / Factor + 1];

            decimator.Process(input, output);
            decimator.Reset();

            var afterReset = new float[output.Length];
            Decimator fresh = CreateDecimator();
            var freshOutput = new float[output.Length];

            int a = decimator.Process(input, afterReset);
            int b = fresh.Process(input, freshOutput);

            Assert.That(a, Is.EqualTo(b));
            for (int i = 0; i < a; i++)
            {
                Assert.That(afterReset[i], Is.EqualTo(freshOutput[i]).Within(1e-6f),
                    "Après Reset, le décimateur doit se comporter comme s'il venait d'être créé.");
            }
        }

        [Test]
        public void UnTamponDeSortieTropPetit_EstSignale()
        {
            // Mieux vaut une exception nette qu'un silence qui avale des échantillons.
            Decimator decimator = CreateDecimator();
            var input = new float[600];
            var tooSmall = new float[10];

            Assert.Throws<ArgumentException>(() => decimator.Process(input, tooSmall));
        }

        [Test]
        public void UnNombreDeCoefficientsPair_EstRefuse()
        {
            // Un filtre symétrique a besoin d'un centre, sinon il décale le signal
            // d'un demi-échantillon et déforme la forme d'onde.
            Assert.Throws<ArgumentOutOfRangeException>(
                () => new Decimator(Factor, InputRate, CutoffHz, tapCount: 80));
        }

        [Test]
        public void UneCoupureAuDessusDeNyquist_EstRefusee()
        {
            Assert.Throws<ArgumentOutOfRangeException>(
                () => new Decimator(Factor, InputRate, cutoffHz: 30000f, tapCount: TapCount));
        }

        [Test]
        public void Process_NAllouePasUnSeulOctet()
        {
            Decimator decimator = CreateDecimator();
            var input = new float[600];
            var output = new float[200];
            decimator.Process(input, output);   // appel à blanc

            long before = GC.GetAllocatedBytesForCurrentThread();
            for (int i = 0; i < 1_000; i++)
            {
                decimator.Process(input, output);
            }
            long after = GC.GetAllocatedBytesForCurrentThread();

            Assert.That(after - before, Is.EqualTo(0L));
        }

        // ------------------------------------------------------------------
        //  Outils
        // ------------------------------------------------------------------

        private static float[] MakeSine(int length, float frequencyHz)
        {
            var buffer = new float[length];
            for (int i = 0; i < length; i++)
            {
                buffer[i] = (float)Math.Sin(2.0 * Math.PI * frequencyHz * i / InputRate);
            }
            return buffer;
        }

        private static float Rms(float[] buffer, int start, int count)
        {
            double sum = 0.0;
            for (int i = start; i < start + count; i++)
            {
                sum += (double)buffer[i] * buffer[i];
            }
            return (float)Math.Sqrt(sum / count);
        }
    }
}
