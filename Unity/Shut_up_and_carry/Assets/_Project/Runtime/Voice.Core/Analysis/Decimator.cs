// ---------------------------------------------------------------------------
//  Decimator — réduit la cadence d'échantillonnage avant la détection de hauteur
// ---------------------------------------------------------------------------
//  Le micro fournit 48 000 échantillons par seconde. Chercher la période d'une voix
//  à cette cadence est du gaspillage : une voix humaine ne dépasse pas ~600 Hz, et
//  8 000 échantillons par seconde suffisent largement à la décrire. On divise donc
//  la cadence par six, ce qui divise d'autant le travail du détecteur de hauteur.
//
//  LE PIÈGE À NE PAS MANQUER
//  On ne peut PAS se contenter de garder un échantillon sur six. Tout ce qui dépasse
//  la moitié de la nouvelle cadence — ici 4 000 Hz — ne disparaît pas : il « se replie »
//  vers le bas et réapparaît comme une fréquence basse qui n'a jamais existé. Un sifflement
//  à 7 900 Hz ressortirait à 100 Hz, en plein dans la plage vocale, et le détecteur y verrait
//  une note bien franche. Il faut donc TOUJOURS filtrer avant de jeter des échantillons.
//
//  C'est ce que fait cette classe : un filtre passe-bas, puis le sous-échantillonnage.
//  Le filtre n'est appliqué qu'aux échantillons qu'on garde — inutile de calculer
//  soigneusement cinq valeurs sur six pour les jeter ensuite.
// ---------------------------------------------------------------------------

using System;

namespace SUAC.Voice.Analysis
{
    /// <summary>
    /// Abaisse la cadence d'échantillonnage d'un flux audio, en filtrant au passage
    /// ce qui ne peut pas être représenté à la nouvelle cadence.
    /// </summary>
    /// <remarks>
    /// <para>
    /// <b>Cette classe a une vraie mémoire</b>, et pas seulement des tampons de travail :
    /// un filtre a besoin des échantillons précédents pour calculer le suivant. C'est ce
    /// qui permet de lui donner le son par petits morceaux sans créer de rupture à chaque
    /// jointure. Conséquence : une instance appartient à un seul flux et à un seul thread.
    /// Deux appelants concurrents mélangeraient leurs sons.
    /// </para>
    /// <para>
    /// Au tout début, la mémoire est vide : les premières valeurs produites sont donc
    /// incomplètes, le temps que la ligne à retard se remplisse. C'est le « temps de chauffe »,
    /// de l'ordre de <c>TapCount / Factor</c> échantillons de sortie.
    /// </para>
    /// </remarks>
    internal sealed class Decimator
    {
        private readonly float[] _taps;      // les coefficients du filtre
        private readonly float[] _history;   // les derniers échantillons reçus (ligne à retard)
        private readonly int _factor;

        private int _writeIndex;   // où écrire le prochain échantillon dans _history
        private int _phase;        // combien d'échantillons depuis la dernière sortie

        /// <summary>Nombre d'échantillons d'entrée consommés pour un échantillon de sortie.</summary>
        public int Factor => _factor;

        /// <summary>Nombre de coefficients du filtre. Plus il est élevé, plus la coupure est nette.</summary>
        public int TapCount => _taps.Length;

        /// <summary>
        /// Prépare un décimateur.
        /// </summary>
        /// <param name="factor">Diviseur de cadence. 6 fait passer de 48 kHz à 8 kHz.</param>
        /// <param name="inputSampleRate">Cadence d'entrée, en hertz.</param>
        /// <param name="cutoffHz">
        /// Fréquence à partir de laquelle le filtre commence à couper. Elle doit rester
        /// nettement sous la moitié de la cadence de sortie, car un filtre réel ne coupe
        /// pas net : il lui faut de la marge pour descendre.
        /// </param>
        /// <param name="tapCount">
        /// Nombre de coefficients. Il gouverne la raideur de la coupure : peu de coefficients
        /// donnent une pente molle qui laisse passer des aigus, beaucoup donnent une coupure
        /// franche mais coûtent du temps de calcul. Doit être impair, pour que le filtre ait
        /// un centre et ne déforme pas la forme du signal.
        /// </param>
        public Decimator(int factor, float inputSampleRate, float cutoffHz, int tapCount)
        {
            if (factor < 1)
            {
                throw new ArgumentOutOfRangeException(nameof(factor), "Le diviseur doit valoir au moins 1.");
            }
            if (inputSampleRate <= 0f)
            {
                throw new ArgumentOutOfRangeException(nameof(inputSampleRate), "La cadence doit être positive.");
            }
            if (cutoffHz <= 0f || cutoffHz >= inputSampleRate / 2f)
            {
                throw new ArgumentOutOfRangeException(nameof(cutoffHz),
                    "La coupure doit se situer entre 0 et la moitié de la cadence d'entrée.");
            }
            if (tapCount < 3 || tapCount % 2 == 0)
            {
                throw new ArgumentOutOfRangeException(nameof(tapCount),
                    "Le nombre de coefficients doit être impair et supérieur ou égal à 3.");
            }

            _factor = factor;
            _taps = new float[tapCount];
            _history = new float[tapCount];
            DesignLowPass(_taps, inputSampleRate, cutoffHz);
        }

        /// <summary>
        /// Consomme des échantillons d'entrée et écrit les échantillons de sortie produits.
        /// </summary>
        /// <param name="input">Les échantillons à cette cadence d'entrée.</param>
        /// <param name="output">
        /// Où écrire le résultat. Doit pouvoir contenir <c>input.Length / Factor</c> valeurs,
        /// arrondi au supérieur.
        /// </param>
        /// <returns>Le nombre d'échantillons réellement écrits dans <paramref name="output"/>.</returns>
        /// <remarks>
        /// N'alloue rien. On peut appeler la méthode autant de fois qu'on veut avec des
        /// morceaux de tailles différentes : la mémoire interne assure la continuité.
        /// </remarks>
        public int Process(ReadOnlySpan<float> input, Span<float> output)
        {
            int produced = 0;

            for (int i = 0; i < input.Length; i++)
            {
                // 1. Ranger le nouvel échantillon dans la ligne à retard.
                _history[_writeIndex] = input[i];
                _writeIndex++;
                if (_writeIndex == _history.Length)
                {
                    _writeIndex = 0;
                }

                // 2. Ne produire une sortie qu'un échantillon sur `factor`.
                _phase++;
                if (_phase < _factor)
                {
                    continue;
                }
                _phase = 0;

                if (produced >= output.Length)
                {
                    throw new ArgumentException(
                        "Le tampon de sortie est trop petit pour recevoir tous les échantillons produits.",
                        nameof(output));
                }

                // 3. Filtrer : chaque coefficient multiplie un échantillon du passé,
                //    du plus récent au plus ancien, et on additionne le tout.
                float accumulator = 0f;
                int readIndex = _writeIndex - 1;   // le plus récent est juste avant l'emplacement d'écriture
                if (readIndex < 0)
                {
                    readIndex = _history.Length - 1;
                }

                for (int k = 0; k < _taps.Length; k++)
                {
                    accumulator += _taps[k] * _history[readIndex];
                    readIndex--;
                    if (readIndex < 0)
                    {
                        readIndex = _history.Length - 1;
                    }
                }

                output[produced] = accumulator;
                produced++;
            }

            return produced;
        }

        /// <summary>
        /// Vide la mémoire du filtre. À appeler quand le flux repart de zéro, pour éviter
        /// que du son ancien ne se mélange au nouveau.
        /// </summary>
        public void Reset()
        {
            Array.Clear(_history, 0, _history.Length);
            _writeIndex = 0;
            _phase = 0;
        }

        /// <summary>
        /// Calcule les coefficients d'un filtre passe-bas.
        /// </summary>
        /// <remarks>
        /// Méthode dite du « sinus cardinal fenêtré ». Le filtre passe-bas idéal — celui qui
        /// couperait net — correspond dans le temps à une courbe infinie, le sinus cardinal.
        /// Comme on ne peut pas en garder une infinité de points, on la tronque ; mais tronquer
        /// brutalement crée des ondulations. On l'atténue donc progressivement sur les bords
        /// avec une fenêtre de Blackman, qui échange un peu de raideur contre une coupure
        /// beaucoup plus propre — exactement le compromis qu'on veut ici, puisque le but est
        /// d'empêcher les aigus de se replier.
        /// </remarks>
        private static void DesignLowPass(float[] taps, float sampleRate, float cutoffHz)
        {
            int n = taps.Length;
            double normalizedCutoff = cutoffHz / sampleRate;   // en cycles par échantillon
            double center = (n - 1) / 2.0;
            double sum = 0.0;

            for (int i = 0; i < n; i++)
            {
                double x = i - center;

                // Sinus cardinal, avec son cas particulier au centre (où la formule
                // donnerait 0/0).
                double sinc = Math.Abs(x) < 1e-9
                    ? 2.0 * normalizedCutoff
                    : Math.Sin(2.0 * Math.PI * normalizedCutoff * x) / (Math.PI * x);

                // Fenêtre de Blackman : vaut ~0 aux extrémités, 1 au centre.
                double window = 0.42
                    - 0.50 * Math.Cos(2.0 * Math.PI * i / (n - 1))
                    + 0.08 * Math.Cos(4.0 * Math.PI * i / (n - 1));

                double tap = sinc * window;
                taps[i] = (float)tap;
                sum += tap;
            }

            // Normaliser pour que le filtre laisse passer les basses fréquences sans
            // changer leur niveau : la somme des coefficients doit valoir 1.
            if (Math.Abs(sum) > 1e-12)
            {
                for (int i = 0; i < n; i++)
                {
                    taps[i] = (float)(taps[i] / sum);
                }
            }
        }
    }
}
