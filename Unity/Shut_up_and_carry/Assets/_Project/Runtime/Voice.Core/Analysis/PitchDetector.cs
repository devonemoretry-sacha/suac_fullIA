// ---------------------------------------------------------------------------
//  PitchDetector — trouve la hauteur d'une voix (algorithme YIN)
// ---------------------------------------------------------------------------
//  L'IDÉE DE DÉPART, EN UNE PHRASE
//  Un son qui a une hauteur se répète. Si on décale le signal d'une période et qu'il
//  se superpose à lui-même, on a trouvé la période — donc la fréquence.
//
//  Cette idée naïve échoue de trois façons, et YIN (de Cheveigné & Kawahara, 2002)
//  est exactement cette idée plus les trois corrections. Chaque étape ci-dessous
//  répond à un échec précis :
//
//    1. La fonction de différence  — mesurer à quel point le signal se ressemble
//                                    après chaque décalage possible.
//    2. La normalisation cumulée   — sinon on confond une note avec l'octave en
//                                    dessous, qui se ressemble tout autant.
//    3. Le seuil absolu            — prendre le PREMIER bon décalage, pas le
//                                    meilleur, pour la même raison d'octave.
//    4. L'interpolation            — sinon la précision est catastrophique dans
//                                    les aigus.
//
//  Et en prime, l'étape 2 fournit gratuitement une mesure de « à quel point ce son
//  est vraiment périodique » — ce qui nous dit si le son est voisé, c'est-à-dire s'il
//  a une hauteur du tout. Un chuchotement ou un « ssss » n'en a pas.
// ---------------------------------------------------------------------------

using System;

namespace SUAC.Voice.Analysis
{
    /// <summary>
    /// Détecte la fréquence fondamentale d'un son, et dit si cette fréquence existe.
    /// </summary>
    /// <remarks>
    /// <para>
    /// Cette classe est <b>conceptuellement pure</b> : deux appels avec les mêmes
    /// échantillons donnent le même résultat, elle ne garde aucun souvenir d'un appel
    /// à l'autre. Elle possède en revanche des tampons de travail, alloués une fois à
    /// la construction pour ne rien allouer ensuite.
    /// </para>
    /// <para>
    /// <b>Ces tampons imposent tout de même une règle :</b> une instance ne doit pas être
    /// partagée entre threads. Deux appels simultanés écriraient dans les mêmes tableaux
    /// et se détruiraient mutuellement leurs calculs — la pureté ne tient que tant qu'un
    /// seul appelant est à l'œuvre. Si l'analyse tourne un jour sur plusieurs threads,
    /// chacun aura son instance.
    /// </para>
    /// <para>
    /// Le détecteur travaille sur du son <b>déjà décimé</b> (voir <see cref="Decimator"/>),
    /// typiquement 8 kHz. C'est ce qui rend le calcul abordable.
    /// </para>
    /// </remarks>
    internal sealed class PitchDetector
    {
        private readonly float[] _difference;   // étape 1 : d(τ)
        private readonly float[] _normalized;   // étape 2 : d'(τ)

        private readonly float _sampleRate;
        private readonly int _minLag;
        private readonly int _maxLag;
        private readonly int _windowSize;
        private readonly float _threshold;

        /// <summary>
        /// Nombre d'échantillons que <see cref="Detect"/> exige. C'est la taille de la
        /// fenêtre observée, plus le plus grand décalage à tester.
        /// </summary>
        public int RequiredSampleCount => _windowSize + _maxLag;

        /// <summary>
        /// Prépare un détecteur de hauteur.
        /// </summary>
        /// <param name="sampleRate">Cadence du son fourni à <see cref="Detect"/>, en hertz.</param>
        /// <param name="minHz">
        /// Hauteur la plus grave recherchée. Elle fixe le plus long décalage à tester,
        /// donc la longueur de son qu'il faut observer.
        /// </param>
        /// <param name="maxHz">
        /// Hauteur la plus aiguë recherchée. Attention : un plafond trop bas ne rend pas la
        /// mesure prudente, il la FALSIFIE. Si la vraie hauteur est au-dessus, le décalage
        /// correct est absent de la recherche et l'algorithme retourne le meilleur creux de
        /// ce qui reste — c'est-à-dire une octave en dessous. On fabriquerait l'erreur qu'on
        /// cherche à éviter, sur les cris et les rires justement.
        /// </param>
        /// <param name="threshold">
        /// Seuil d'apériodicité en dessous duquel on considère le son voisé. La littérature
        /// recommande 0,10 à 0,15. C'est le curseur qui décide si un chuchotement est
        /// « du son sans hauteur » ou « rien du tout » : autant un réglage de ressenti que
        /// de traitement du signal.
        /// </param>
        /// <param name="windowSize">
        /// Nombre d'échantillons observés pour chaque comparaison. Il en faut au moins deux
        /// périodes de la note la plus grave, sans quoi il n'y a rien à comparer.
        /// </param>
        public PitchDetector(float sampleRate, float minHz, float maxHz, float threshold, int windowSize)
        {
            if (sampleRate <= 0f)
            {
                throw new ArgumentOutOfRangeException(nameof(sampleRate), "La cadence doit être positive.");
            }
            if (minHz <= 0f || maxHz <= minHz)
            {
                throw new ArgumentOutOfRangeException(nameof(maxHz),
                    "La plage de recherche doit être croissante et strictement positive.");
            }
            if (maxHz >= sampleRate / 2f)
            {
                throw new ArgumentOutOfRangeException(nameof(maxHz),
                    "La hauteur maximale doit rester sous la moitié de la cadence.");
            }
            if (threshold <= 0f)
            {
                throw new ArgumentOutOfRangeException(nameof(threshold), "Le seuil doit être positif.");
            }

            _sampleRate = sampleRate;
            _threshold = threshold;

            // Décalage et fréquence sont inverses l'un de l'autre : plus la note est grave,
            // plus sa période est longue, donc plus le décalage à tester est grand.
            _minLag = Math.Max(1, (int)Math.Floor(sampleRate / maxHz));
            _maxLag = (int)Math.Ceiling(sampleRate / minHz);

            int minimumUsefulWindow = 2 * _maxLag;
            if (windowSize < minimumUsefulWindow)
            {
                throw new ArgumentOutOfRangeException(nameof(windowSize),
                    $"Il faut au moins deux périodes de la note la plus grave, soit {minimumUsefulWindow} échantillons.");
            }
            _windowSize = windowSize;

            _difference = new float[_maxLag + 1];
            _normalized = new float[_maxLag + 1];
        }

        /// <summary>
        /// Cherche la hauteur du son fourni.
        /// </summary>
        /// <param name="buffer">
        /// Au moins <see cref="RequiredSampleCount"/> échantillons consécutifs.
        /// </param>
        /// <remarks>N'alloue rien : tous les tampons ont été créés à la construction.</remarks>
        public RawPitch Detect(ReadOnlySpan<float> buffer)
        {
            if (buffer.Length < RequiredSampleCount)
            {
                // Pas assez de son pour se prononcer. On ne devine pas.
                return RawPitch.Unvoiced(1f);
            }

            ComputeDifference(buffer);
            ComputeNormalizedDifference();

            int lag = FindFirstDipBelowThreshold();
            if (lag < 0)
            {
                // Aucun décalage n'est assez convaincant : le son n'a pas de hauteur.
                // On renvoie tout de même la meilleure apériodicité trouvée, utile au débogage.
                return RawPitch.Unvoiced(FindBestAperiodicity());
            }

            float refinedLag = RefineByInterpolation(lag);
            float frequency = _sampleRate / refinedLag;

            return new RawPitch(frequency, _normalized[lag], isVoiced: true);
        }

        /// <summary>
        /// Étape 1 — pour chaque décalage, mesurer à quel point le signal diffère de
        /// lui-même décalé d'autant. Un décalage égal à la période donne une différence
        /// proche de zéro.
        /// </summary>
        private void ComputeDifference(ReadOnlySpan<float> buffer)
        {
            _difference[0] = 0f;

            // On calcule depuis le décalage 1, et pas seulement depuis _minLag : l'étape 2
            // a besoin de TOUS les décalages précédents pour établir sa moyenne courante.
            // Tronquer ici casserait la protection contre les erreurs d'octave.
            for (int lag = 1; lag <= _maxLag; lag++)
            {
                float sum = 0f;
                for (int j = 0; j < _windowSize; j++)
                {
                    float delta = buffer[j] - buffer[j + lag];
                    sum += delta * delta;
                }
                _difference[lag] = sum;
            }
        }

        /// <summary>
        /// Étape 2 — la normalisation cumulée, cœur de YIN.
        /// </summary>
        /// <remarks>
        /// On divise chaque différence par la moyenne de toutes celles qui la précèdent.
        /// Deux effets, tous deux essentiels :
        /// <list type="bullet">
        ///   <item>la courbe part de 1 et ne descend en dessous que là où il y a une vraie
        ///         périodicité — ce qui rend un seuil fixe utilisable pour tous les sons ;</item>
        ///   <item>les grands décalages sont pénalisés d'autant plus qu'ils sont grands. Or
        ///         l'octave en dessous, c'est exactement un décalage deux fois plus long :
        ///         c'est ici que se joue la défense principale contre l'erreur d'octave.</item>
        /// </list>
        /// </remarks>
        private void ComputeNormalizedDifference()
        {
            _normalized[0] = 1f;
            float runningSum = 0f;

            for (int lag = 1; lag <= _maxLag; lag++)
            {
                runningSum += _difference[lag];

                _normalized[lag] = runningSum > 0f
                    ? _difference[lag] * lag / runningSum
                    : 1f;   // signal parfaitement plat (silence) : aucune périodicité
            }
        }

        /// <summary>
        /// Étape 3 — retenir le PREMIER creux qui passe sous le seuil, pas le plus profond.
        /// </summary>
        /// <remarks>
        /// C'est la deuxième défense contre l'erreur d'octave, et elle tient en une phrase :
        /// l'octave en dessous produit souvent un creux légèrement plus profond que la vraie
        /// fondamentale. Chercher le minimum global reviendrait donc à choisir l'octave du
        /// dessous une fois sur cinq. En prenant le premier creux acceptable, on choisit la
        /// période la plus courte qui explique le signal — c'est-à-dire la bonne.
        /// </remarks>
        /// <returns>Le décalage retenu, ou -1 si aucun ne passe le seuil.</returns>
        private int FindFirstDipBelowThreshold()
        {
            for (int lag = _minLag; lag <= _maxLag; lag++)
            {
                if (_normalized[lag] >= _threshold)
                {
                    continue;
                }

                // On est entré dans un creux : descendre jusqu'à son point le plus bas
                // avant de le retenir, sinon on s'arrêterait sur son flanc.
                while (lag + 1 <= _maxLag && _normalized[lag + 1] < _normalized[lag])
                {
                    lag++;
                }
                return lag;
            }

            return -1;
        }

        /// <summary>
        /// Quand aucun creux ne passe le seuil, on retourne quand même la valeur la plus
        /// basse rencontrée : elle dit à quel point on est passé près, ce qui aide à régler
        /// le seuil et à comprendre un comportement inattendu.
        /// </summary>
        private float FindBestAperiodicity()
        {
            float best = 1f;
            for (int lag = _minLag; lag <= _maxLag; lag++)
            {
                if (_normalized[lag] < best)
                {
                    best = _normalized[lag];
                }
            }
            return best;
        }

        /// <summary>
        /// Étape 4 — affiner le décalage entre deux échantillons entiers.
        /// </summary>
        /// <remarks>
        /// Sans cette étape la précision serait inacceptable. À 8 kHz, un décalage de 20
        /// échantillons vaut 400 Hz et 21 en vaut 381 : un écart de 85 cents, presque un
        /// demi-ton, parfaitement audible. Le vrai minimum tombe presque toujours entre deux
        /// échantillons. On fait donc passer une parabole par le creux et ses deux voisins,
        /// et on retient l'abscisse de son sommet, ce qui ramène l'erreur à quelques cents.
        /// </remarks>
        private float RefineByInterpolation(int lag)
        {
            // Aux extrémités il manque un voisin : on garde la valeur entière.
            if (lag <= 0 || lag >= _maxLag)
            {
                return lag;
            }

            float before = _normalized[lag - 1];
            float at = _normalized[lag];
            float after = _normalized[lag + 1];

            float curvature = before - 2f * at + after;
            if (Math.Abs(curvature) < 1e-9f)
            {
                // Les trois points sont alignés : pas de sommet identifiable.
                return lag;
            }

            float offset = 0.5f * (before - after) / curvature;

            // Un sommet situé à plus d'un demi-échantillon du creux signalerait un calcul
            // aberrant plutôt qu'un affinage. On refuse de le suivre.
            if (offset < -1f || offset > 1f)
            {
                return lag;
            }

            return lag + offset;
        }
    }
}
