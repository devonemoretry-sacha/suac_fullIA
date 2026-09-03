// ---------------------------------------------------------------------------
//  LoudnessMeter — mesure l'intensité et la forme d'une fenêtre de son
// ---------------------------------------------------------------------------
//  Premier maillon de la chaîne d'analyse. On lui donne un petit morceau de son
//  (environ 20 ms d'échantillons) et il en ressort deux nombres : la valeur efficace
//  et la crête. Rien de plus.
//
//  Il est SANS ÉTAT : deux appels avec les mêmes échantillons donnent toujours le
//  même résultat. C'est ce qui le rend testable sans micro et sans lancer le jeu.
// ---------------------------------------------------------------------------

using System;

namespace SUAC.Voice.Analysis
{
    /// <summary>
    /// Mesure l'intensité d'une fenêtre d'échantillons audio.
    /// </summary>
    /// <remarks>
    /// Statique et sans mémoire : aucun tampon réutilisé, aucune valeur conservée entre
    /// deux appels. C'est ce qui la rend <b>utilisable depuis n'importe quel thread</b>,
    /// contrairement aux objets d'analyse qui gardent un état ou des tampons de travail
    /// (voir <see cref="EnvelopeFollower"/>).
    /// </remarks>
    internal static class LoudnessMeter
    {
        /// <summary>
        /// Parcourt la fenêtre une seule fois et en extrait la valeur efficace (RMS)
        /// et l'amplitude de crête.
        /// </summary>
        /// <param name="window">
        /// Les échantillons à mesurer. Ce sont des valeurs comprises entre -1 et +1 :
        /// un son est une oscillation autour de zéro, comme la membrane d'un haut-parleur
        /// qui avance et recule.
        /// </param>
        /// <returns>
        /// Les mesures brutes. Sur une fenêtre vide, retourne des mesures à zéro
        /// plutôt que de lever une exception : une capture qui démarre peut légitimement
        /// ne rien avoir à offrir, et ce n'est pas une erreur.
        /// </returns>
        /// <remarks>
        /// <b>N'alloue rien.</b> Le paramètre est un <see cref="ReadOnlySpan{T}"/>, une vue
        /// sur des données existantes plutôt qu'une copie, et le retour est une structure.
        /// Cette méthode est appelée une cinquantaine de fois par seconde : si elle allouait,
        /// le ramasse-miettes finirait par provoquer des micro-saccades. Un test vérifie
        /// qu'elle n'alloue pas un octet.
        /// </remarks>
        public static RawLoudness Measure(ReadOnlySpan<float> window)
        {
            if (window.Length == 0)
            {
                return default;
            }

            // On accumule en double plutôt qu'en float. Sur un millier d'additions,
            // les erreurs d'arrondi du float finiraient par se voir ; le double coûte
            // le même temps ici et supprime la question.
            double sumOfSquares = 0.0;
            float peak = 0f;

            for (int i = 0; i < window.Length; i++)
            {
                float sample = window[i];

                // Pourquoi élever au carré plutôt que faire une moyenne ?
                // Parce qu'un son oscille autant au-dessus qu'en dessous de zéro : sa
                // moyenne est toujours proche de zéro, quel que soit son volume. Le carré
                // rend toutes les valeurs positives et donne une mesure d'énergie.
                sumOfSquares += (double)sample * sample;

                // La crête ne s'intéresse qu'à la distance à zéro, peu importe le signe.
                float magnitude = Math.Abs(sample);
                if (magnitude > peak)
                {
                    peak = magnitude;
                }
            }

            // RMS = « Root Mean Square », littéralement racine de la moyenne des carrés.
            // On défait le carré pour revenir à une amplitude comparable à celle des
            // échantillons de départ.
            float rms = (float)Math.Sqrt(sumOfSquares / window.Length);

            return new RawLoudness(rms, peak);
        }
    }
}
