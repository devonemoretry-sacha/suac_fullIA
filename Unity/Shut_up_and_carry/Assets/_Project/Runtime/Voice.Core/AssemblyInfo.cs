// ---------------------------------------------------------------------------
//  AssemblyInfo — réglages qui s'appliquent à toute l'assembly SUAC.Voice.Core
// ---------------------------------------------------------------------------
//  Une bonne partie du code de cette assembly est déclarée « internal », c'est-à-dire
//  invisible depuis les autres assemblies du projet. C'est volontaire : ce sont les
//  mesures brutes (décibels, hertz), et elles ne doivent jamais atteindre le gameplay.
//
//  Les tests, eux, ont besoin de les voir pour les vérifier. La ligne ci-dessous ouvre
//  cet accès à la seule assembly de tests, et à personne d'autre.
// ---------------------------------------------------------------------------

using System.Runtime.CompilerServices;

[assembly: InternalsVisibleTo("SUAC.Tests.EditMode")]
