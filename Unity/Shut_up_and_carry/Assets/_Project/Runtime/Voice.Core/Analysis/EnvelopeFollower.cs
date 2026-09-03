// ---------------------------------------------------------------------------
//  EnvelopeFollower — lisse une mesure qui saute dans tous les sens
// ---------------------------------------------------------------------------
//  Mesurée fenêtre par fenêtre, l'intensité de la voix est très nerveuse : elle
//  bondit sur chaque syllabe et retombe entre deux mots. Branchée telle quelle sur
//  le poids d'un meuble, elle le ferait vibrer en permanence.
//
//  Cette classe suit la mesure « de loin ». Elle monte vite quand le son augmente
//  (on veut sentir un cri immédiatement) et redescend lentement (on ne veut pas que
//  le canapé clignote entre lourd et léger entre deux syllabes). Deux vitesses
//  différentes, donc, d'où les deux réglages.
//
//  C'est le SEUL type de ce dossier qui a une mémoire : son résultat dépend des
//  appels précédents. Partout ailleurs, ce sont des fonctions pures.
// ---------------------------------------------------------------------------

using System;

namespace SUAC.Voice.Analysis
{
    /// <summary>
    /// Suiveur d'enveloppe à deux vitesses : une pour la montée, une pour la descente.
    /// </summary>
    /// <remarks>
    /// <para>
    /// Techniquement, c'est un filtre passe-bas du premier ordre dont le coefficient
    /// change selon qu'on monte ou qu'on descend. Chaque appel rapproche un peu la
    /// valeur courante de la valeur visée, sans jamais l'atteindre d'un coup.
    /// </para>
    /// <para>
    /// <b>Cette classe n'est pas utilisable depuis plusieurs threads.</b> Elle conserve une
    /// valeur d'un appel au suivant : deux threads qui appelleraient <see cref="Process"/>
    /// en même temps se marcheraient dessus et produiraient une enveloppe incohérente.
    /// Une instance appartient à un et un seul propriétaire.
    /// </para>
    /// <para>
    /// La même mise en garde vaudra pour tout objet d'analyse possédant des tampons de
    /// travail pré-alloués, même quand ces objets sont conceptuellement purs. Un tampon
    /// réutilisé n'est pas une mémoire tant qu'un seul thread y touche ; à deux, il en
    /// devient une, et l'un écrase les calculs de l'autre. La règle du projet :
    /// <i>un objet d'analyse n'est jamais partagé entre threads</i>. Si un jour l'analyse
    /// tourne sur un worker, chaque worker aura ses propres instances.
    /// </para>
    /// </remarks>
    internal sealed class EnvelopeFollower
    {
        private readonly float _attackCoefficient;
        private readonly float _releaseCoefficient;
        private float _value;

        /// <summary>La valeur lissée actuelle, sans avancer le filtre.</summary>
        public float Value => _value;

        /// <summary>
        /// Prépare un suiveur d'enveloppe.
        /// </summary>
        /// <param name="attackSeconds">
        /// Temps de montée. Il ne s'agit pas du temps pour atteindre la cible — le filtre
        /// s'en approche indéfiniment — mais du temps pour en parcourir environ 63 %.
        /// C'est la convention habituelle pour ce type de filtre, dite « constante de
        /// temps ». Une valeur de 0 rend la montée instantanée.
        /// </param>
        /// <param name="releaseSeconds">Temps de descente, même convention.</param>
        /// <param name="updateRateHz">
        /// Nombre d'appels à <see cref="Process"/> par seconde. Le filtre en a besoin pour
        /// convertir des durées en coefficients : monter en 50 ms n'exige pas le même pas
        /// selon qu'on l'appelle 50 ou 200 fois par seconde.
        /// </param>
        public EnvelopeFollower(float attackSeconds, float releaseSeconds, float updateRateHz)
        {
            if (updateRateHz <= 0f)
            {
                throw new ArgumentOutOfRangeException(nameof(updateRateHz),
                    "La cadence d'appel doit être strictement positive.");
            }
            if (attackSeconds < 0f)
            {
                throw new ArgumentOutOfRangeException(nameof(attackSeconds),
                    "Un temps de montée ne peut pas être négatif.");
            }
            if (releaseSeconds < 0f)
            {
                throw new ArgumentOutOfRangeException(nameof(releaseSeconds),
                    "Un temps de descente ne peut pas être négatif.");
            }

            _attackCoefficient = CoefficientFor(attackSeconds, updateRateHz);
            _releaseCoefficient = CoefficientFor(releaseSeconds, updateRateHz);
            _value = 0f;
        }

        /// <summary>
        /// Fait avancer le filtre d'un pas et retourne la nouvelle valeur lissée.
        /// À appeler exactement une fois par fenêtre d'analyse.
        /// </summary>
        public float Process(float input)
        {
            // Monte-t-on ou descend-on ? C'est ce qui décide de la vitesse employée.
            float coefficient = input > _value ? _attackCoefficient : _releaseCoefficient;

            // On lit la formule ainsi : « repartir de la cible, puis remonter d'une
            // fraction de l'écart qu'il restait ». Avec un coefficient de 0, on saute
            // directement sur la cible ; proche de 1, on ne bouge presque pas.
            _value = input + (_value - input) * coefficient;

            return _value;
        }

        /// <summary>
        /// Remet le filtre à une valeur connue. À utiliser quand la capture reprend après
        /// une coupure, pour éviter que la valeur d'avant ne se prolonge artificiellement.
        /// </summary>
        public void Reset(float value = 0f) => _value = value;

        /// <summary>
        /// Traduit une constante de temps en coefficient de filtre.
        /// </summary>
        private static float CoefficientFor(float timeConstantSeconds, float updateRateHz)
        {
            // Une constante de temps nulle veut dire « pas de lissage » : le coefficient 0
            // fait que la valeur suit exactement l'entrée.
            if (timeConstantSeconds <= 0f)
            {
                return 0f;
            }

            // L'exponentielle décroissante est la forme naturelle de ce filtre : après un
            // nombre d'appels égal à (durée × cadence), il ne reste que 1/e ≈ 37 % de
            // l'écart initial — donc 63 % du chemin est parcouru, comme annoncé plus haut.
            return (float)Math.Exp(-1.0 / (timeConstantSeconds * updateRateHz));
        }
    }
}
