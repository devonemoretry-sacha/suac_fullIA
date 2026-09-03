// ---------------------------------------------------------------------------
//  RawLoudness — l'intensité BRUTE d'une fenêtre de son
// ---------------------------------------------------------------------------
//  Ce type est « internal » : il n'existe que pour cette assembly. C'est la règle
//  la plus importante du système vocal, alors autant l'expliquer ici.
//
//  Une mesure brute est exprimée dans les unités du signal — ici une amplitude,
//  ailleurs des hertz. Or ces unités dépendent du joueur : la même phrase donne des
//  valeurs différentes selon qu'on a une voix grave ou aiguë, un micro saturé ou faible.
//  Si une seule de ces valeurs atteignait le gameplay, deux joueurs fournissant le même
//  effort obtiendraient des résultats différents — l'équité vocale s'effondrerait.
//
//  Le trajet est donc à sens unique : mesure brute → calibration → VoiceFrame normalisée.
//  Et comme le gameplay vit dans une autre assembly, il ne PEUT PAS lire ce type.
//  La barrière n'est pas une promesse écrite dans la doc, c'est une règle de compilation.
//
//  Le préfixe « Raw » est là pour qu'on n'ait pas besoin d'ouvrir ce fichier : partout où
//  il apparaît, il rappelle qu'on manipule une valeur qui n'a pas le droit de sortir.
// ---------------------------------------------------------------------------

namespace SUAC.Voice.Analysis
{
    /// <summary>
    /// Ce qu'on a mesuré de l'intensité d'une fenêtre de son, avant toute normalisation.
    /// Ne quitte jamais l'assembly SUAC.Voice.Core.
    /// </summary>
    internal readonly struct RawLoudness
    {
        /// <summary>
        /// Valeur efficace du signal (RMS), en amplitude linéaire de 0 à 1.
        /// C'est la mesure d'intensité « ressentie » : elle tient compte de toute la
        /// fenêtre, pas seulement de son point le plus fort.
        /// </summary>
        public readonly float Rms;

        /// <summary>
        /// Amplitude du point le plus fort de la fenêtre, de 0 à 1.
        /// </summary>
        public readonly float Peak;

        public RawLoudness(float rms, float peak)
        {
            Rms = rms;
            Peak = peak;
        }

        /// <summary>
        /// Rapport entre la crête et le RMS — le « facteur de crête ».
        /// </summary>
        /// <remarks>
        /// C'est la forme du son résumée en un nombre, et c'est ce qui distingue un son
        /// percussif d'un son tenu :
        /// <list type="bullet">
        ///   <item>une note tenue est régulière, sa crête dépasse peu sa moyenne → rapport
        ///         faible (environ 1,41 pour un son pur) ;</item>
        ///   <item>un clic est un pic isolé dans du silence, sa crête écrase sa moyenne
        ///         → rapport très élevé.</item>
        /// </list>
        /// C'est donc la matière première de la troisième brique du GDD, la forme
        /// temporelle. La conversion de ce rapport vers <c>VoiceFrame.Continuity</c> se
        /// fera plus tard, avec des seuils réglables.
        /// <para>
        /// Vaut 0 si le RMS est nul : sur du silence, il n'y a pas de forme à décrire, et
        /// on évite au passage une division par zéro.
        /// </para>
        /// </remarks>
        public float CrestFactor => Rms > 0f ? Peak / Rms : 0f;
    }
}
