// ---------------------------------------------------------------------------
//  RawPitch — la hauteur BRUTE d'une fenêtre de son
// ---------------------------------------------------------------------------
//  Même règle que RawLoudness : « internal », et pour la même raison. Une hauteur en
//  hertz ne veut rien dire tant qu'on ne sait pas à qui appartient la voix. 150 Hz,
//  c'est une voix posée pour l'un et un aigu pour l'autre. Seule la calibration peut
//  traduire ces hertz en un écart comparable entre joueurs.
// ---------------------------------------------------------------------------

namespace SUAC.Voice.Analysis
{
    /// <summary>
    /// Ce qu'on a mesuré de la hauteur d'une fenêtre de son, avant toute normalisation.
    /// Ne quitte jamais l'assembly SUAC.Voice.Core.
    /// </summary>
    internal readonly struct RawPitch
    {
        /// <summary>
        /// Fréquence fondamentale en hertz. Vaut 0 quand le son n'est pas voisé —
        /// dans ce cas il n'y a pas de hauteur à mesurer, pas même une mauvaise.
        /// </summary>
        public readonly float F0Hz;

        /// <summary>
        /// À quel point le son s'écarte d'une répétition parfaite, de 0 (parfaitement
        /// périodique) à 1 et au-delà (aucune périodicité).
        /// </summary>
        /// <remarks>
        /// C'est un sous-produit gratuit de l'algorithme : la mesure qui sert à trouver la
        /// période sert aussi à dire si cette période existe vraiment. Une voyelle chantée
        /// tombe très bas ; un « ssss », un chuchotement ou du bruit restent hauts.
        /// </remarks>
        public readonly float Aperiodicity;

        /// <summary>
        /// <c>true</c> si le son est assez périodique pour que <see cref="F0Hz"/> ait un sens.
        /// </summary>
        /// <remarks>
        /// C'est ce champ qui alimentera <c>VoiceFrame.Voiced</c>, et donc la règle du GDD
        /// « ce que la mesure interdit » : un objet sensible à la hauteur ne doit réagir
        /// que lorsque ce drapeau est levé.
        /// </remarks>
        public readonly bool IsVoiced;

        public RawPitch(float f0Hz, float aperiodicity, bool isVoiced)
        {
            F0Hz = isVoiced ? f0Hz : 0f;   // même garde que VoiceFrame : pas de hauteur fantôme
            Aperiodicity = aperiodicity;
            IsVoiced = isVoiced;
        }

        /// <summary>
        /// Un son sans hauteur. L'apériodicité mesurée est conservée : même quand elle ne
        /// franchit pas le seuil, elle reste utile pour comprendre ce qui s'est passé.
        /// </summary>
        public static RawPitch Unvoiced(float aperiodicity) => new RawPitch(0f, aperiodicity, false);
    }
}
