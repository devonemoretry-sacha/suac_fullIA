// ---------------------------------------------------------------------------
//  PublicSurfaceTests — la garde qui protège l'équité vocale
// ---------------------------------------------------------------------------
//  Le système vocal repose sur une règle : les mesures brutes (amplitudes, hertz)
//  ne doivent jamais atteindre le gameplay. Sinon deux joueurs fournissant le même
//  effort obtiendraient des résultats différents selon leur voix ou leur micro.
//
//  Le compilateur fait déjà l'essentiel du travail : C# interdit qu'un membre public
//  expose un type « internal ». La fuite par signature est donc impossible aujourd'hui.
//
//  Il reste un trou, un seul : quelqu'un — nous, dans six mois — peut passer un type
//  de « internal » à « public » pour dépanner. Ce test ferme ce trou. Il affirme que
//  la surface publique de SUAC.Voice.Core est EXACTEMENT la liste ci-dessous. Rendre
//  quoi que ce soit public fait tomber le test, et pour le réparer il faut ajouter le
//  type à la liste — donc le décider consciemment, pas par distraction.
// ---------------------------------------------------------------------------

using System;
using System.Linq;
using System.Reflection;
using NUnit.Framework;
using SUAC.Voice;

namespace SUAC.Tests.Voice
{
    public sealed class PublicSurfaceTests
    {
        /// <summary>
        /// Les seuls types que SUAC.Voice.Core a le droit d'exposer au reste du projet.
        /// Toute addition ici doit être un choix délibéré, pas une commodité passagère.
        /// </summary>
        private static readonly string[] AllowedPublicTypes =
        {
            "SUAC.Voice.VoiceFrame",
        };

        [Test]
        public void LaSurfacePubliqueDeVoiceCore_EstExactementCelleAutorisee()
        {
            Assembly voiceCore = typeof(VoiceFrame).Assembly;

            string[] actual = voiceCore
                .GetExportedTypes()      // ne retourne que les types visibles de l'extérieur
                .Select(t => t.FullName)
                .OrderBy(name => name, StringComparer.Ordinal)
                .ToArray();

            string[] expected = AllowedPublicTypes
                .OrderBy(name => name, StringComparer.Ordinal)
                .ToArray();

            Assert.That(actual, Is.EqualTo(expected),
                "La surface publique de SUAC.Voice.Core a changé.\n" +
                "Si tu viens de rendre un type public : est-ce que ce type expose des unités " +
                "brutes (décibels, hertz, amplitudes) ? Si oui, il doit rester internal — le " +
                "gameplay ne doit voir que des valeurs normalisées, sinon l'équité entre " +
                "joueurs tombe (GDD 2.4.1).\n" +
                "Si l'ajout est légitime, inscris le type dans AllowedPublicTypes.");
        }

        [TestCase("SUAC.Voice.Analysis.RawLoudness", "des amplitudes")]
        [TestCase("SUAC.Voice.Analysis.RawPitch", "des hertz")]
        public void LesMesuresBrutes_RestentInvisiblesDepuisLExterieur(string typeName, string carries)
        {
            // Une vérification redondante avec la précédente, mais qui nomme explicitement
            // les types sensibles : celui qui lira l'échec comprendra tout de suite l'enjeu.
            Type rawType = typeof(VoiceFrame).Assembly.GetType(typeName, throwOnError: true);

            Assert.That(rawType.IsPublic, Is.False,
                $"{typeName} transporte {carries} et doit rester internal — " +
                "seule la calibration peut traduire ces unités en valeurs comparables entre joueurs.");
        }
    }
}
