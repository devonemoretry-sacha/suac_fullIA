// ---------------------------------------------------------------------------
//  VoiceFrame — le relevé de la voix d'un joueur à un instant donné
// ---------------------------------------------------------------------------
//  C'est LA structure que l'analyse vocale expose au reste du jeu. Tout ce qui
//  réagit à la voix — un meuble, un monstre, un monte-meuble — lit une VoiceFrame
//  et rien d'autre. C'est aussi ce qui est envoyé sur le réseau vers l'hôte.
//
//  Si tu découvres le projet, commence par ce fichier : il décrit en cinq champs
//  tout ce que le jeu sait de ta voix.
// ---------------------------------------------------------------------------

using System;

namespace SUAC.Voice
{
    /// <summary>
    /// Relevé de la voix d'un joueur sur une courte fenêtre de son (~20 ms).
    /// </summary>
    /// <remarks>
    /// <para>
    /// Les trois premiers champs correspondent exactement aux trois « briques » du
    /// game design (GDD 2.4.1) : le volume, la hauteur, la forme temporelle. Ce n'est
    /// pas une coïncidence — le format a été dérivé du design, pas inventé pour le code.
    /// Conséquence pratique : un objet qui ne se décrit pas avec ces champs ne se décrit
    /// pas non plus dans la grille du GDD.
    /// </para>
    /// <para>
    /// <b>Toutes les valeurs sont normalisées.</b> Aucun décibel, aucun hertz n'apparaît
    /// ici. Un même effort vocal produit la même VoiceFrame que le joueur ait une voix
    /// grave ou aiguë, un micro saturé ou faible. C'est ce qui garantit l'équité entre
    /// joueurs (GDD 2.4.1, « L'équité vocale »). Les unités brutes existent, mais elles
    /// restent enfermées dans cette assembly et ne peuvent pas en sortir.
    /// </para>
    /// <para>
    /// C'est une <c>readonly struct</c> : une valeur immuable, copiée telle quelle plutôt
    /// qu'allouée sur le tas. Elle ne donne donc jamais de travail au ramasse-miettes,
    /// ce qui compte quand on en produit une cinquantaine par seconde et par joueur.
    /// </para>
    /// </remarks>
    public readonly struct VoiceFrame
    {
        /// <summary>
        /// Intensité de la voix, de 0 (silence) à 1 (le cri de ce joueur-là).
        /// </summary>
        public readonly float Loudness;

        /// <summary>
        /// Hauteur de la voix, exprimée en demi-tons d'écart par rapport à la hauteur
        /// habituelle <i>de ce joueur</i>. 0 = sa voix normale, +12 = une octave au-dessus,
        /// -12 = une octave en dessous.
        /// </summary>
        /// <remarks>
        /// Cette valeur n'a de sens que si <see cref="Voiced"/> vaut <c>true</c>.
        /// Sur un son non-voisé, elle est à zéro et doit être ignorée.
        /// </remarks>
        public readonly float Pitch;

        /// <summary>
        /// Texture du son, de 0 (percussif : un clic, un claquement de langue)
        /// à 1 (régulier : une note tenue, une voyelle).
        /// </summary>
        /// <remarks>
        /// Attention au contresens : c'est la texture <i>de l'instant</i>, pas une durée.
        /// Ce champ ne dit pas « ça fait dix secondes que la note tient ». Savoir si une
        /// note dure relève du gameplay, qui observe la suite des VoiceFrame et applique
        /// ses propres règles — le monte-meuble veut quinze secondes, apaiser un monstre
        /// en veut trois. La règle du projet est : le cœur vocal lisse la mesure,
        /// le gameplay accumule le sens.
        /// </remarks>
        public readonly float Continuity;

        /// <summary>
        /// Indique si le son est « voisé », c'est-à-dire produit par la vibration des
        /// cordes vocales — une voyelle, un chant, une parole normale.
        /// </summary>
        /// <remarks>
        /// Quand ce champ vaut <c>false</c>, il n'y a physiquement <i>aucune</i> hauteur à
        /// mesurer. C'est le cas du chuchotement, des sifflantes (« sss », « chhh ») et des
        /// consonnes explosives (« t », « k »). Un objet sensible à la hauteur doit donc
        /// ignorer ces trames, sinon il s'affole à chaque consonne (GDD 2.4.1, « Ce que la
        /// mesure interdit »).
        /// </remarks>
        public readonly bool Voiced;

        /// <summary>
        /// Numéro de la fenêtre d'analyse, incrémenté de 1 à chaque relevé. Il permet
        /// d'ordonner les trames et de repérer un trou après un passage sur le réseau.
        /// </summary>
        public readonly uint Tick;

        /// <summary>
        /// Construit un relevé. Les valeurs hors bornes sont ramenées dans leur intervalle
        /// plutôt que refusées : une trame reçue du réseau peut avoir été altérée, et on
        /// préfère une valeur bornée à une exception en pleine partie.
        /// </summary>
        public VoiceFrame(float loudness, float pitch, float continuity, bool voiced, uint tick)
        {
            Loudness = Math.Clamp(loudness, 0f, 1f);
            Continuity = Math.Clamp(continuity, 0f, 1f);

            // Sur un son non-voisé, la hauteur n'existe pas : on la force à zéro
            // pour qu'aucun consommateur distrait ne puisse lire une valeur fantôme.
            Pitch = voiced ? pitch : 0f;

            Voiced = voiced;
            Tick = tick;
        }

        /// <summary>
        /// Le relevé d'un silence. Pratique comme valeur de départ, ou quand la capture
        /// n'a pas encore fourni assez d'échantillons pour une première mesure.
        /// </summary>
        public static VoiceFrame Silence(uint tick) => new VoiceFrame(0f, 0f, 0f, false, tick);

        /// <summary>
        /// Représentation lisible, pour le débogage et les messages de test.
        /// </summary>
        /// <remarks>
        /// Cette méthode alloue une chaîne : ne l'appelle pas dans une boucle de jeu.
        /// </remarks>
        public override string ToString() =>
            Voiced
                ? $"VoiceFrame(#{Tick} vol={Loudness:0.00} pitch={Pitch:+0.0;-0.0;0.0}dt cont={Continuity:0.00})"
                : $"VoiceFrame(#{Tick} vol={Loudness:0.00} non-voisé cont={Continuity:0.00})";
    }
}
