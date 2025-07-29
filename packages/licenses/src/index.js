const customLicenses = {
  'FREE-NOS': {
    isOpenSource: true,
    name: 'Free License (Not Otherwise Specified)',
    reference: 'https://choosealicense.com'
  },
  'NON-FREE-COMMERCIAL-NOS': {
    isOpenSource: false,
    name: 'Non-Free License (Commercial, Not Otherwise Specified)',
    reference: 'https://choosealicense.com'
  },
  'NON-FREE-NON-COMMERCIAL-NOS': {
    isOpenSource: false,
    name: 'Non-Free License (Non-Commercial, Not Otherwise Specified)',
    reference: 'https://choosealicense.com'
  },
  'NON-FREE-NOS': {
    isOpenSource: false,
    name: 'Non-Free License (Not Otherwise Specified)',
    reference: 'https://choosealicense.com'
  },
  'PUBLIC-DOMAIN': {
    isOpenSource: true,
    name: 'Public Domain',
    reference: 'https://choosealicense.com'
  },
  UNLICENSED: {
    isOpenSource: false,
    name: 'Unlicensed/Unknown',
    reference: 'https://choosealicense.com'
  }
};

const spdxLicenses = {
  '0BSD': {
    isOpenSource: true,
    name: 'BSD Zero Clause License',
    reference: 'https://spdx.org/licenses/0BSD.html'
  },
  AAL: {
    isOpenSource: true,
    name: 'Attribution Assurance License',
    reference: 'https://spdx.org/licenses/AAL.html'
  },
  Abstyles: {
    isOpenSource: false,
    name: 'Abstyles License',
    reference: 'https://spdx.org/licenses/Abstyles.html'
  },
  'AdaCore-doc': {
    isOpenSource: false,
    name: 'AdaCore Doc License',
    reference: 'https://spdx.org/licenses/AdaCore-doc.html'
  },
  'Adobe-2006': {
    isOpenSource: false,
    name: 'Adobe Systems Incorporated Source Code License Agreement',
    reference: 'https://spdx.org/licenses/Adobe-2006.html'
  },
  'Adobe-Display-PostScript': {
    isOpenSource: false,
    name: 'Adobe Display PostScript License',
    reference: 'https://spdx.org/licenses/Adobe-Display-PostScript.html'
  },
  'Adobe-Glyph': {
    isOpenSource: false,
    name: 'Adobe Glyph List License',
    reference: 'https://spdx.org/licenses/Adobe-Glyph.html'
  },
  'Adobe-Utopia': {
    isOpenSource: false,
    name: 'Adobe Utopia Font License',
    reference: 'https://spdx.org/licenses/Adobe-Utopia.html'
  },
  ADSL: {
    isOpenSource: false,
    name: 'Amazon Digital Services License',
    reference: 'https://spdx.org/licenses/ADSL.html'
  },
  'AFL-1.1': {
    isOpenSource: true,
    name: 'Academic Free License v1.1',
    reference: 'https://spdx.org/licenses/AFL-1.1.html'
  },
  'AFL-1.2': {
    isOpenSource: true,
    name: 'Academic Free License v1.2',
    reference: 'https://spdx.org/licenses/AFL-1.2.html'
  },
  'AFL-2.0': {
    isOpenSource: true,
    name: 'Academic Free License v2.0',
    reference: 'https://spdx.org/licenses/AFL-2.0.html'
  },
  'AFL-2.1': {
    isOpenSource: true,
    name: 'Academic Free License v2.1',
    reference: 'https://spdx.org/licenses/AFL-2.1.html'
  },
  'AFL-3.0': {
    isOpenSource: true,
    name: 'Academic Free License v3.0',
    reference: 'https://spdx.org/licenses/AFL-3.0.html'
  },
  Afmparse: {
    isOpenSource: false,
    name: 'Afmparse License',
    reference: 'https://spdx.org/licenses/Afmparse.html'
  },
  'AGPL-1.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Affero General Public License v1.0',
    reference: 'https://spdx.org/licenses/AGPL-1.0.html'
  },
  'AGPL-1.0-only': {
    isOpenSource: false,
    name: 'Affero General Public License v1.0 only',
    reference: 'https://spdx.org/licenses/AGPL-1.0-only.html'
  },
  'AGPL-1.0-or-later': {
    isOpenSource: false,
    name: 'Affero General Public License v1.0 or later',
    reference: 'https://spdx.org/licenses/AGPL-1.0-or-later.html'
  },
  'AGPL-3.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU Affero General Public License v3.0',
    reference: 'https://spdx.org/licenses/AGPL-3.0.html'
  },
  'AGPL-3.0-only': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU Affero General Public License v3.0 only',
    reference: 'https://spdx.org/licenses/AGPL-3.0-only.html'
  },
  'AGPL-3.0-or-later': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU Affero General Public License v3.0 or later',
    reference: 'https://spdx.org/licenses/AGPL-3.0-or-later.html'
  },
  Aladdin: {
    isOpenSource: false,
    name: 'Aladdin Free Public License',
    reference: 'https://spdx.org/licenses/Aladdin.html'
  },
  AMDPLPA: {
    isOpenSource: false,
    name: "AMD's plpa_map.c License",
    reference: 'https://spdx.org/licenses/AMDPLPA.html'
  },
  AML: {
    isOpenSource: false,
    name: 'Apple MIT License',
    reference: 'https://spdx.org/licenses/AML.html'
  },
  'AML-glslang': {
    isOpenSource: false,
    name: 'AML glslang variant License',
    reference: 'https://spdx.org/licenses/AML-glslang.html'
  },
  AMPAS: {
    isOpenSource: false,
    name: 'Academy of Motion Picture Arts and Sciences BSD',
    reference: 'https://spdx.org/licenses/AMPAS.html'
  },
  'ANTLR-PD': {
    isOpenSource: false,
    name: 'ANTLR Software Rights Notice',
    reference: 'https://spdx.org/licenses/ANTLR-PD.html'
  },
  'ANTLR-PD-fallback': {
    isOpenSource: false,
    name: 'ANTLR Software Rights Notice with license fallback',
    reference: 'https://spdx.org/licenses/ANTLR-PD-fallback.html'
  },
  'Apache-1.0': {
    isOpenSource: true,
    name: 'Apache License 1.0',
    reference: 'https://spdx.org/licenses/Apache-1.0.html'
  },
  'Apache-1.1': {
    isOpenSource: true,
    name: 'Apache License 1.1',
    reference: 'https://spdx.org/licenses/Apache-1.1.html'
  },
  'Apache-2.0': {
    isOpenSource: true,
    name: 'Apache License 2.0',
    reference: 'https://spdx.org/licenses/Apache-2.0.html'
  },
  APAFML: {
    isOpenSource: false,
    name: 'Adobe Postscript AFM License',
    reference: 'https://spdx.org/licenses/APAFML.html'
  },
  'APL-1.0': {
    isOpenSource: true,
    name: 'Adaptive Public License 1.0',
    reference: 'https://spdx.org/licenses/APL-1.0.html'
  },
  'App-s2p': {
    isOpenSource: false,
    name: 'App::s2p License',
    reference: 'https://spdx.org/licenses/App-s2p.html'
  },
  'APSL-1.0': {
    isOpenSource: true,
    name: 'Apple Public Source License 1.0',
    reference: 'https://spdx.org/licenses/APSL-1.0.html'
  },
  'APSL-1.1': {
    isOpenSource: true,
    name: 'Apple Public Source License 1.1',
    reference: 'https://spdx.org/licenses/APSL-1.1.html'
  },
  'APSL-1.2': {
    isOpenSource: true,
    name: 'Apple Public Source License 1.2',
    reference: 'https://spdx.org/licenses/APSL-1.2.html'
  },
  'APSL-2.0': {
    isOpenSource: true,
    name: 'Apple Public Source License 2.0',
    reference: 'https://spdx.org/licenses/APSL-2.0.html'
  },
  'Arphic-1999': {
    isOpenSource: false,
    name: 'Arphic Public License',
    reference: 'https://spdx.org/licenses/Arphic-1999.html'
  },
  'Artistic-1.0': {
    isOpenSource: true,
    name: 'Artistic License 1.0',
    reference: 'https://spdx.org/licenses/Artistic-1.0.html'
  },
  'Artistic-1.0-cl8': {
    isOpenSource: true,
    name: 'Artistic License 1.0 w/clause 8',
    reference: 'https://spdx.org/licenses/Artistic-1.0-cl8.html'
  },
  'Artistic-1.0-Perl': {
    isOpenSource: true,
    name: 'Artistic License 1.0 (Perl)',
    reference: 'https://spdx.org/licenses/Artistic-1.0-Perl.html'
  },
  'Artistic-2.0': {
    isOpenSource: true,
    name: 'Artistic License 2.0',
    reference: 'https://spdx.org/licenses/Artistic-2.0.html'
  },
  'ASWF-Digital-Assets-1.0': {
    isOpenSource: false,
    name: 'ASWF Digital Assets License version 1.0',
    reference: 'https://spdx.org/licenses/ASWF-Digital-Assets-1.0.html'
  },
  'ASWF-Digital-Assets-1.1': {
    isOpenSource: false,
    name: 'ASWF Digital Assets License 1.1',
    reference: 'https://spdx.org/licenses/ASWF-Digital-Assets-1.1.html'
  },
  Baekmuk: {
    isOpenSource: false,
    name: 'Baekmuk License',
    reference: 'https://spdx.org/licenses/Baekmuk.html'
  },
  Bahyph: {
    isOpenSource: false,
    name: 'Bahyph License',
    reference: 'https://spdx.org/licenses/Bahyph.html'
  },
  Barr: {
    isOpenSource: false,
    name: 'Barr License',
    reference: 'https://spdx.org/licenses/Barr.html'
  },
  Beerware: {
    isOpenSource: false,
    name: 'Beerware License',
    reference: 'https://spdx.org/licenses/Beerware.html'
  },
  'Bitstream-Charter': {
    isOpenSource: false,
    name: 'Bitstream Charter Font License',
    reference: 'https://spdx.org/licenses/Bitstream-Charter.html'
  },
  'Bitstream-Vera': {
    isOpenSource: false,
    name: 'Bitstream Vera Font License',
    reference: 'https://spdx.org/licenses/Bitstream-Vera.html'
  },
  'BitTorrent-1.0': {
    isOpenSource: false,
    name: 'BitTorrent Open Source License v1.0',
    reference: 'https://spdx.org/licenses/BitTorrent-1.0.html'
  },
  'BitTorrent-1.1': {
    isOpenSource: true,
    name: 'BitTorrent Open Source License v1.1',
    reference: 'https://spdx.org/licenses/BitTorrent-1.1.html'
  },
  blessing: {
    isOpenSource: false,
    name: 'SQLite Blessing',
    reference: 'https://spdx.org/licenses/blessing.html'
  },
  'BlueOak-1.0.0': {
    isOpenSource: true,
    name: 'Blue Oak Model License 1.0.0',
    reference: 'https://spdx.org/licenses/BlueOak-1.0.0.html'
  },
  'Boehm-GC': {
    isOpenSource: false,
    name: 'Boehm-Demers-Weiser GC License',
    reference: 'https://spdx.org/licenses/Boehm-GC.html'
  },
  Borceux: {
    isOpenSource: false,
    name: 'Borceux license',
    reference: 'https://spdx.org/licenses/Borceux.html'
  },
  'Brian-Gladman-3-Clause': {
    isOpenSource: false,
    name: 'Brian Gladman 3-Clause License',
    reference: 'https://spdx.org/licenses/Brian-Gladman-3-Clause.html'
  },
  'BSD-1-Clause': {
    isOpenSource: true,
    name: 'BSD 1-Clause License',
    reference: 'https://spdx.org/licenses/BSD-1-Clause.html'
  },
  'BSD-2-Clause': {
    isOpenSource: true,
    name: 'BSD 2-Clause "Simplified" License',
    reference: 'https://spdx.org/licenses/BSD-2-Clause.html'
  },
  'BSD-2-Clause-FreeBSD': {
    isOpenSource: true,
    name: 'BSD 2-Clause FreeBSD License',
    reference: 'https://spdx.org/licenses/BSD-2-Clause-FreeBSD.html'
  },
  'BSD-2-Clause-NetBSD': {
    isOpenSource: true,
    name: 'BSD 2-Clause NetBSD License',
    reference: 'https://spdx.org/licenses/BSD-2-Clause-NetBSD.html'
  },
  'BSD-2-Clause-Patent': {
    isOpenSource: true,
    name: 'BSD-2-Clause Plus Patent License',
    reference: 'https://spdx.org/licenses/BSD-2-Clause-Patent.html'
  },
  'BSD-2-Clause-Views': {
    isOpenSource: false,
    name: 'BSD 2-Clause with views sentence',
    reference: 'https://spdx.org/licenses/BSD-2-Clause-Views.html'
  },
  'BSD-3-Clause': {
    isOpenSource: true,
    name: 'BSD 3-Clause "New" or "Revised" License',
    reference: 'https://spdx.org/licenses/BSD-3-Clause.html'
  },
  'BSD-3-Clause-acpica': {
    isOpenSource: false,
    name: 'BSD 3-Clause acpica variant',
    reference: 'https://spdx.org/licenses/BSD-3-Clause-acpica.html'
  },
  'BSD-3-Clause-Attribution': {
    isOpenSource: false,
    name: 'BSD with attribution',
    reference: 'https://spdx.org/licenses/BSD-3-Clause-Attribution.html'
  },
  'BSD-3-Clause-Clear': {
    isOpenSource: true,
    name: 'BSD 3-Clause Clear License',
    reference: 'https://spdx.org/licenses/BSD-3-Clause-Clear.html'
  },
  'BSD-3-Clause-flex': {
    isOpenSource: false,
    name: 'BSD 3-Clause Flex variant',
    reference: 'https://spdx.org/licenses/BSD-3-Clause-flex.html'
  },
  'BSD-3-Clause-HP': {
    isOpenSource: false,
    name: 'Hewlett-Packard BSD variant license',
    reference: 'https://spdx.org/licenses/BSD-3-Clause-HP.html'
  },
  'BSD-3-Clause-LBNL': {
    isOpenSource: true,
    name: 'Lawrence Berkeley National Labs BSD variant license',
    reference: 'https://spdx.org/licenses/BSD-3-Clause-LBNL.html'
  },
  'BSD-3-Clause-Modification': {
    isOpenSource: false,
    name: 'BSD 3-Clause Modification',
    reference: 'https://spdx.org/licenses/BSD-3-Clause-Modification.html'
  },
  'BSD-3-Clause-No-Military-License': {
    isOpenSource: false,
    name: 'BSD 3-Clause No Military License',
    reference: 'https://spdx.org/licenses/BSD-3-Clause-No-Military-License.html'
  },
  'BSD-3-Clause-No-Nuclear-License': {
    isOpenSource: false,
    name: 'BSD 3-Clause No Nuclear License',
    reference: 'https://spdx.org/licenses/BSD-3-Clause-No-Nuclear-License.html'
  },
  'BSD-3-Clause-No-Nuclear-License-2014': {
    isOpenSource: false,
    name: 'BSD 3-Clause No Nuclear License 2014',
    reference: 'https://spdx.org/licenses/BSD-3-Clause-No-Nuclear-License-2014.html'
  },
  'BSD-3-Clause-No-Nuclear-Warranty': {
    isOpenSource: false,
    name: 'BSD 3-Clause No Nuclear Warranty',
    reference: 'https://spdx.org/licenses/BSD-3-Clause-No-Nuclear-Warranty.html'
  },
  'BSD-3-Clause-Open-MPI': {
    isOpenSource: false,
    name: 'BSD 3-Clause Open MPI variant',
    reference: 'https://spdx.org/licenses/BSD-3-Clause-Open-MPI.html'
  },
  'BSD-3-Clause-Sun': {
    isOpenSource: false,
    name: 'BSD 3-Clause Sun Microsystems',
    reference: 'https://spdx.org/licenses/BSD-3-Clause-Sun.html'
  },
  'BSD-4-Clause': {
    isOpenSource: true,
    name: 'BSD 4-Clause "Original" or "Old" License',
    reference: 'https://spdx.org/licenses/BSD-4-Clause.html'
  },
  'BSD-4-Clause-Shortened': {
    isOpenSource: false,
    name: 'BSD 4 Clause Shortened',
    reference: 'https://spdx.org/licenses/BSD-4-Clause-Shortened.html'
  },
  'BSD-4-Clause-UC': {
    isOpenSource: false,
    name: 'BSD-4-Clause (University of California-Specific)',
    reference: 'https://spdx.org/licenses/BSD-4-Clause-UC.html'
  },
  'BSD-4.3RENO': {
    isOpenSource: false,
    name: 'BSD 4.3 RENO License',
    reference: 'https://spdx.org/licenses/BSD-4.3RENO.html'
  },
  'BSD-4.3TAHOE': {
    isOpenSource: false,
    name: 'BSD 4.3 TAHOE License',
    reference: 'https://spdx.org/licenses/BSD-4.3TAHOE.html'
  },
  'BSD-Advertising-Acknowledgement': {
    isOpenSource: false,
    name: 'BSD Advertising Acknowledgement License',
    reference: 'https://spdx.org/licenses/BSD-Advertising-Acknowledgement.html'
  },
  'BSD-Attribution-HPND-disclaimer': {
    isOpenSource: false,
    name: 'BSD with Attribution and HPND disclaimer',
    reference: 'https://spdx.org/licenses/BSD-Attribution-HPND-disclaimer.html'
  },
  'BSD-Inferno-Nettverk': {
    isOpenSource: false,
    name: 'BSD-Inferno-Nettverk',
    reference: 'https://spdx.org/licenses/BSD-Inferno-Nettverk.html'
  },
  'BSD-Protection': {
    isOpenSource: false,
    name: 'BSD Protection License',
    reference: 'https://spdx.org/licenses/BSD-Protection.html'
  },
  'BSD-Source-beginning-file': {
    isOpenSource: false,
    name: 'BSD Source Code Attribution - beginning of file variant',
    reference: 'https://spdx.org/licenses/BSD-Source-beginning-file.html'
  },
  'BSD-Source-Code': {
    isOpenSource: false,
    name: 'BSD Source Code Attribution',
    reference: 'https://spdx.org/licenses/BSD-Source-Code.html'
  },
  'BSD-Systemics': {
    isOpenSource: false,
    name: 'Systemics BSD variant license',
    reference: 'https://spdx.org/licenses/BSD-Systemics.html'
  },
  'BSD-Systemics-W3Works': {
    isOpenSource: false,
    name: 'Systemics W3Works BSD variant license',
    reference: 'https://spdx.org/licenses/BSD-Systemics-W3Works.html'
  },
  'BSL-1.0': {
    isOpenSource: true,
    name: 'Boost Software License 1.0',
    reference: 'https://spdx.org/licenses/BSL-1.0.html'
  },
  'BUSL-1.1': {
    isOpenSource: false,
    name: 'Business Source License 1.1',
    reference: 'https://spdx.org/licenses/BUSL-1.1.html'
  },
  'bzip2-1.0.5': {
    isOpenSource: false,
    name: 'bzip2 and libbzip2 License v1.0.5',
    reference: 'https://spdx.org/licenses/bzip2-1.0.5.html'
  },
  'bzip2-1.0.6': {
    isOpenSource: false,
    name: 'bzip2 and libbzip2 License v1.0.6',
    reference: 'https://spdx.org/licenses/bzip2-1.0.6.html'
  },
  'C-UDA-1.0': {
    isOpenSource: false,
    name: 'Computational Use of Data Agreement v1.0',
    reference: 'https://spdx.org/licenses/C-UDA-1.0.html'
  },
  'CAL-1.0': {
    isOpenSource: true,
    name: 'Cryptographic Autonomy License 1.0',
    reference: 'https://spdx.org/licenses/CAL-1.0.html'
  },
  'CAL-1.0-Combined-Work-Exception': {
    isOpenSource: true,
    name: 'Cryptographic Autonomy License 1.0 (Combined Work Exception)',
    reference: 'https://spdx.org/licenses/CAL-1.0-Combined-Work-Exception.html'
  },
  Caldera: {
    isOpenSource: false,
    name: 'Caldera License',
    reference: 'https://spdx.org/licenses/Caldera.html'
  },
  'Caldera-no-preamble': {
    isOpenSource: false,
    name: 'Caldera License (without preamble)',
    reference: 'https://spdx.org/licenses/Caldera-no-preamble.html'
  },
  'CATOSL-1.1': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Computer Associates Trusted Open Source License 1.1',
    reference: 'https://spdx.org/licenses/CATOSL-1.1.html'
  },
  'CC0-1.0': {
    isOpenSource: true,
    name: 'Creative Commons Zero v1.0 Universal',
    reference: 'https://spdx.org/licenses/CC0-1.0.html'
  },
  'CC-BY-1.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution 1.0 Generic',
    reference: 'https://spdx.org/licenses/CC-BY-1.0.html'
  },
  'CC-BY-2.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution 2.0 Generic',
    reference: 'https://spdx.org/licenses/CC-BY-2.0.html'
  },
  'CC-BY-2.5': {
    isOpenSource: false,
    name: 'Creative Commons Attribution 2.5 Generic',
    reference: 'https://spdx.org/licenses/CC-BY-2.5.html'
  },
  'CC-BY-2.5-AU': {
    isOpenSource: false,
    name: 'Creative Commons Attribution 2.5 Australia',
    reference: 'https://spdx.org/licenses/CC-BY-2.5-AU.html'
  },
  'CC-BY-3.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution 3.0 Unported',
    reference: 'https://spdx.org/licenses/CC-BY-3.0.html'
  },
  'CC-BY-3.0-AT': {
    isOpenSource: false,
    name: 'Creative Commons Attribution 3.0 Austria',
    reference: 'https://spdx.org/licenses/CC-BY-3.0-AT.html'
  },
  'CC-BY-3.0-AU': {
    isOpenSource: false,
    name: 'Creative Commons Attribution 3.0 Australia',
    reference: 'https://spdx.org/licenses/CC-BY-3.0-AU.html'
  },
  'CC-BY-3.0-DE': {
    isOpenSource: false,
    name: 'Creative Commons Attribution 3.0 Germany',
    reference: 'https://spdx.org/licenses/CC-BY-3.0-DE.html'
  },
  'CC-BY-3.0-IGO': {
    isOpenSource: false,
    name: 'Creative Commons Attribution 3.0 IGO',
    reference: 'https://spdx.org/licenses/CC-BY-3.0-IGO.html'
  },
  'CC-BY-3.0-NL': {
    isOpenSource: false,
    name: 'Creative Commons Attribution 3.0 Netherlands',
    reference: 'https://spdx.org/licenses/CC-BY-3.0-NL.html'
  },
  'CC-BY-3.0-US': {
    isOpenSource: false,
    name: 'Creative Commons Attribution 3.0 United States',
    reference: 'https://spdx.org/licenses/CC-BY-3.0-US.html'
  },
  'CC-BY-4.0': {
    isOpenSource: true,
    name: 'Creative Commons Attribution 4.0 International',
    reference: 'https://spdx.org/licenses/CC-BY-4.0.html'
  },
  'CC-BY-NC-1.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial 1.0 Generic',
    reference: 'https://spdx.org/licenses/CC-BY-NC-1.0.html'
  },
  'CC-BY-NC-2.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial 2.0 Generic',
    reference: 'https://spdx.org/licenses/CC-BY-NC-2.0.html'
  },
  'CC-BY-NC-2.5': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial 2.5 Generic',
    reference: 'https://spdx.org/licenses/CC-BY-NC-2.5.html'
  },
  'CC-BY-NC-3.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial 3.0 Unported',
    reference: 'https://spdx.org/licenses/CC-BY-NC-3.0.html'
  },
  'CC-BY-NC-3.0-DE': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial 3.0 Germany',
    reference: 'https://spdx.org/licenses/CC-BY-NC-3.0-DE.html'
  },
  'CC-BY-NC-4.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial 4.0 International',
    reference: 'https://spdx.org/licenses/CC-BY-NC-4.0.html'
  },
  'CC-BY-NC-ND-1.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial No Derivatives 1.0 Generic',
    reference: 'https://spdx.org/licenses/CC-BY-NC-ND-1.0.html'
  },
  'CC-BY-NC-ND-2.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial No Derivatives 2.0 Generic',
    reference: 'https://spdx.org/licenses/CC-BY-NC-ND-2.0.html'
  },
  'CC-BY-NC-ND-2.5': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial No Derivatives 2.5 Generic',
    reference: 'https://spdx.org/licenses/CC-BY-NC-ND-2.5.html'
  },
  'CC-BY-NC-ND-3.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial No Derivatives 3.0 Unported',
    reference: 'https://spdx.org/licenses/CC-BY-NC-ND-3.0.html'
  },
  'CC-BY-NC-ND-3.0-DE': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial No Derivatives 3.0 Germany',
    reference: 'https://spdx.org/licenses/CC-BY-NC-ND-3.0-DE.html'
  },
  'CC-BY-NC-ND-3.0-IGO': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial No Derivatives 3.0 IGO',
    reference: 'https://spdx.org/licenses/CC-BY-NC-ND-3.0-IGO.html'
  },
  'CC-BY-NC-ND-4.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial No Derivatives 4.0 International',
    reference: 'https://spdx.org/licenses/CC-BY-NC-ND-4.0.html'
  },
  'CC-BY-NC-SA-1.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial Share Alike 1.0 Generic',
    reference: 'https://spdx.org/licenses/CC-BY-NC-SA-1.0.html'
  },
  'CC-BY-NC-SA-2.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial Share Alike 2.0 Generic',
    reference: 'https://spdx.org/licenses/CC-BY-NC-SA-2.0.html'
  },
  'CC-BY-NC-SA-2.0-DE': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial Share Alike 2.0 Germany',
    reference: 'https://spdx.org/licenses/CC-BY-NC-SA-2.0-DE.html'
  },
  'CC-BY-NC-SA-2.0-FR': {
    isOpenSource: false,
    name: 'Creative Commons Attribution-NonCommercial-ShareAlike 2.0 France',
    reference: 'https://spdx.org/licenses/CC-BY-NC-SA-2.0-FR.html'
  },
  'CC-BY-NC-SA-2.0-UK': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial Share Alike 2.0 England and Wales',
    reference: 'https://spdx.org/licenses/CC-BY-NC-SA-2.0-UK.html'
  },
  'CC-BY-NC-SA-2.5': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial Share Alike 2.5 Generic',
    reference: 'https://spdx.org/licenses/CC-BY-NC-SA-2.5.html'
  },
  'CC-BY-NC-SA-3.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial Share Alike 3.0 Unported',
    reference: 'https://spdx.org/licenses/CC-BY-NC-SA-3.0.html'
  },
  'CC-BY-NC-SA-3.0-DE': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial Share Alike 3.0 Germany',
    reference: 'https://spdx.org/licenses/CC-BY-NC-SA-3.0-DE.html'
  },
  'CC-BY-NC-SA-3.0-IGO': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial Share Alike 3.0 IGO',
    reference: 'https://spdx.org/licenses/CC-BY-NC-SA-3.0-IGO.html'
  },
  'CC-BY-NC-SA-4.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Non Commercial Share Alike 4.0 International',
    reference: 'https://spdx.org/licenses/CC-BY-NC-SA-4.0.html'
  },
  'CC-BY-ND-1.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution No Derivatives 1.0 Generic',
    reference: 'https://spdx.org/licenses/CC-BY-ND-1.0.html'
  },
  'CC-BY-ND-2.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution No Derivatives 2.0 Generic',
    reference: 'https://spdx.org/licenses/CC-BY-ND-2.0.html'
  },
  'CC-BY-ND-2.5': {
    isOpenSource: false,
    name: 'Creative Commons Attribution No Derivatives 2.5 Generic',
    reference: 'https://spdx.org/licenses/CC-BY-ND-2.5.html'
  },
  'CC-BY-ND-3.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution No Derivatives 3.0 Unported',
    reference: 'https://spdx.org/licenses/CC-BY-ND-3.0.html'
  },
  'CC-BY-ND-3.0-DE': {
    isOpenSource: false,
    name: 'Creative Commons Attribution No Derivatives 3.0 Germany',
    reference: 'https://spdx.org/licenses/CC-BY-ND-3.0-DE.html'
  },
  'CC-BY-ND-4.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution No Derivatives 4.0 International',
    reference: 'https://spdx.org/licenses/CC-BY-ND-4.0.html'
  },
  'CC-BY-SA-1.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Share Alike 1.0 Generic',
    reference: 'https://spdx.org/licenses/CC-BY-SA-1.0.html'
  },
  'CC-BY-SA-2.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Share Alike 2.0 Generic',
    reference: 'https://spdx.org/licenses/CC-BY-SA-2.0.html'
  },
  'CC-BY-SA-2.0-UK': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Share Alike 2.0 England and Wales',
    reference: 'https://spdx.org/licenses/CC-BY-SA-2.0-UK.html'
  },
  'CC-BY-SA-2.1-JP': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Share Alike 2.1 Japan',
    reference: 'https://spdx.org/licenses/CC-BY-SA-2.1-JP.html'
  },
  'CC-BY-SA-2.5': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Share Alike 2.5 Generic',
    reference: 'https://spdx.org/licenses/CC-BY-SA-2.5.html'
  },
  'CC-BY-SA-3.0': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Share Alike 3.0 Unported',
    reference: 'https://spdx.org/licenses/CC-BY-SA-3.0.html'
  },
  'CC-BY-SA-3.0-AT': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Share Alike 3.0 Austria',
    reference: 'https://spdx.org/licenses/CC-BY-SA-3.0-AT.html'
  },
  'CC-BY-SA-3.0-DE': {
    isOpenSource: false,
    name: 'Creative Commons Attribution Share Alike 3.0 Germany',
    reference: 'https://spdx.org/licenses/CC-BY-SA-3.0-DE.html'
  },
  'CC-BY-SA-3.0-IGO': {
    isOpenSource: false,
    name: 'Creative Commons Attribution-ShareAlike 3.0 IGO',
    reference: 'https://spdx.org/licenses/CC-BY-SA-3.0-IGO.html'
  },
  'CC-BY-SA-4.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Creative Commons Attribution Share Alike 4.0 International',
    reference: 'https://spdx.org/licenses/CC-BY-SA-4.0.html'
  },
  'CC-PDDC': {
    isOpenSource: false,
    name: 'Creative Commons Public Domain Dedication and Certification',
    reference: 'https://spdx.org/licenses/CC-PDDC.html'
  },
  'CDDL-1.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Common Development and Distribution License 1.0',
    reference: 'https://spdx.org/licenses/CDDL-1.0.html'
  },
  'CDDL-1.1': {
    isOpenSource: false,
    name: 'Common Development and Distribution License 1.1',
    reference: 'https://spdx.org/licenses/CDDL-1.1.html'
  },
  'CDL-1.0': {
    isOpenSource: false,
    name: 'Common Documentation License 1.0',
    reference: 'https://spdx.org/licenses/CDL-1.0.html'
  },
  'CDLA-Permissive-1.0': {
    isOpenSource: false,
    name: 'Community Data License Agreement Permissive 1.0',
    reference: 'https://spdx.org/licenses/CDLA-Permissive-1.0.html'
  },
  'CDLA-Permissive-2.0': {
    isOpenSource: false,
    name: 'Community Data License Agreement Permissive 2.0',
    reference: 'https://spdx.org/licenses/CDLA-Permissive-2.0.html'
  },
  'CDLA-Sharing-1.0': {
    isOpenSource: false,
    name: 'Community Data License Agreement Sharing 1.0',
    reference: 'https://spdx.org/licenses/CDLA-Sharing-1.0.html'
  },
  'CECILL-1.0': {
    isOpenSource: false,
    name: 'CeCILL Free Software License Agreement v1.0',
    reference: 'https://spdx.org/licenses/CECILL-1.0.html'
  },
  'CECILL-1.1': {
    isOpenSource: false,
    name: 'CeCILL Free Software License Agreement v1.1',
    reference: 'https://spdx.org/licenses/CECILL-1.1.html'
  },
  'CECILL-2.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'CeCILL Free Software License Agreement v2.0',
    reference: 'https://spdx.org/licenses/CECILL-2.0.html'
  },
  'CECILL-2.1': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'CeCILL Free Software License Agreement v2.1',
    reference: 'https://spdx.org/licenses/CECILL-2.1.html'
  },
  'CECILL-B': {
    isOpenSource: true,
    name: 'CeCILL-B Free Software License Agreement',
    reference: 'https://spdx.org/licenses/CECILL-B.html'
  },
  'CECILL-C': {
    isOpenSource: true,
    name: 'CeCILL-C Free Software License Agreement',
    reference: 'https://spdx.org/licenses/CECILL-C.html'
  },
  'CERN-OHL-1.1': {
    isOpenSource: false,
    name: 'CERN Open Hardware Licence v1.1',
    reference: 'https://spdx.org/licenses/CERN-OHL-1.1.html'
  },
  'CERN-OHL-1.2': {
    isOpenSource: false,
    name: 'CERN Open Hardware Licence v1.2',
    reference: 'https://spdx.org/licenses/CERN-OHL-1.2.html'
  },
  'CERN-OHL-P-2.0': {
    isOpenSource: true,
    name: 'CERN Open Hardware Licence Version 2 - Permissive',
    reference: 'https://spdx.org/licenses/CERN-OHL-P-2.0.html'
  },
  'CERN-OHL-S-2.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'CERN Open Hardware Licence Version 2 - Strongly Reciprocal',
    reference: 'https://spdx.org/licenses/CERN-OHL-S-2.0.html'
  },
  'CERN-OHL-W-2.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'CERN Open Hardware Licence Version 2 - Weakly Reciprocal',
    reference: 'https://spdx.org/licenses/CERN-OHL-W-2.0.html'
  },
  CFITSIO: {
    isOpenSource: false,
    name: 'CFITSIO License',
    reference: 'https://spdx.org/licenses/CFITSIO.html'
  },
  'check-cvs': {
    isOpenSource: false,
    name: 'check-cvs License',
    reference: 'https://spdx.org/licenses/check-cvs.html'
  },
  checkmk: {
    isOpenSource: false,
    name: 'Checkmk License',
    reference: 'https://spdx.org/licenses/checkmk.html'
  },
  ClArtistic: {
    isOpenSource: true,
    name: 'Clarified Artistic License',
    reference: 'https://spdx.org/licenses/ClArtistic.html'
  },
  Clips: {
    isOpenSource: false,
    name: 'Clips License',
    reference: 'https://spdx.org/licenses/Clips.html'
  },
  'CMU-Mach': {
    isOpenSource: false,
    name: 'CMU Mach License',
    reference: 'https://spdx.org/licenses/CMU-Mach.html'
  },
  'CNRI-Jython': {
    isOpenSource: false,
    name: 'CNRI Jython License',
    reference: 'https://spdx.org/licenses/CNRI-Jython.html'
  },
  'CNRI-Python': {
    isOpenSource: true,
    name: 'CNRI Python License',
    reference: 'https://spdx.org/licenses/CNRI-Python.html'
  },
  'CNRI-Python-GPL-Compatible': {
    isOpenSource: false,
    name: 'CNRI Python Open Source GPL Compatible License Agreement',
    reference: 'https://spdx.org/licenses/CNRI-Python-GPL-Compatible.html'
  },
  'COIL-1.0': {
    isOpenSource: false,
    name: 'Copyfree Open Innovation License',
    reference: 'https://spdx.org/licenses/COIL-1.0.html'
  },
  'Community-Spec-1.0': {
    isOpenSource: false,
    name: 'Community Specification License 1.0',
    reference: 'https://spdx.org/licenses/Community-Spec-1.0.html'
  },
  'Condor-1.1': {
    isOpenSource: true,
    name: 'Condor Public License v1.1',
    reference: 'https://spdx.org/licenses/Condor-1.1.html'
  },
  'copyleft-next-0.3.0': {
    isOpenSource: false,
    name: 'copyleft-next 0.3.0',
    reference: 'https://spdx.org/licenses/copyleft-next-0.3.0.html'
  },
  'copyleft-next-0.3.1': {
    isOpenSource: false,
    name: 'copyleft-next 0.3.1',
    reference: 'https://spdx.org/licenses/copyleft-next-0.3.1.html'
  },
  'Cornell-Lossless-JPEG': {
    isOpenSource: false,
    name: 'Cornell Lossless JPEG License',
    reference: 'https://spdx.org/licenses/Cornell-Lossless-JPEG.html'
  },
  'CPAL-1.0': {
    isOpenSource: true,
    name: 'Common Public Attribution License 1.0',
    reference: 'https://spdx.org/licenses/CPAL-1.0.html'
  },
  'CPL-1.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Common Public License 1.0',
    reference: 'https://spdx.org/licenses/CPL-1.0.html'
  },
  'CPOL-1.02': {
    isOpenSource: false,
    name: 'Code Project Open License 1.02',
    reference: 'https://spdx.org/licenses/CPOL-1.02.html'
  },
  Cronyx: {
    isOpenSource: false,
    name: 'Cronyx License',
    reference: 'https://spdx.org/licenses/Cronyx.html'
  },
  Crossword: {
    isOpenSource: false,
    name: 'Crossword License',
    reference: 'https://spdx.org/licenses/Crossword.html'
  },
  CrystalStacker: {
    isOpenSource: false,
    name: 'CrystalStacker License',
    reference: 'https://spdx.org/licenses/CrystalStacker.html'
  },
  'CUA-OPL-1.0': {
    isOpenSource: true,
    name: 'CUA Office Public License v1.0',
    reference: 'https://spdx.org/licenses/CUA-OPL-1.0.html'
  },
  Cube: {
    isOpenSource: false,
    name: 'Cube License',
    reference: 'https://spdx.org/licenses/Cube.html'
  },
  curl: {
    isOpenSource: false,
    name: 'curl License',
    reference: 'https://spdx.org/licenses/curl.html'
  },
  'D-FSL-1.0': {
    isOpenSource: false,
    name: 'Deutsche Freie Software Lizenz',
    reference: 'https://spdx.org/licenses/D-FSL-1.0.html'
  },
  'DEC-3-Clause': {
    isOpenSource: false,
    name: 'DEC 3-Clause License',
    reference: 'https://spdx.org/licenses/DEC-3-Clause.html'
  },
  diffmark: {
    isOpenSource: false,
    name: 'diffmark license',
    reference: 'https://spdx.org/licenses/diffmark.html'
  },
  'DL-DE-BY-2.0': {
    isOpenSource: false,
    name: 'Data licence Germany – attribution – version 2.0',
    reference: 'https://spdx.org/licenses/DL-DE-BY-2.0.html'
  },
  'DL-DE-ZERO-2.0': {
    isOpenSource: false,
    name: 'Data licence Germany – zero – version 2.0',
    reference: 'https://spdx.org/licenses/DL-DE-ZERO-2.0.html'
  },
  DOC: {
    isOpenSource: false,
    name: 'DOC License',
    reference: 'https://spdx.org/licenses/DOC.html'
  },
  Dotseqn: {
    isOpenSource: false,
    name: 'Dotseqn License',
    reference: 'https://spdx.org/licenses/Dotseqn.html'
  },
  'DRL-1.0': {
    isOpenSource: false,
    name: 'Detection Rule License 1.0',
    reference: 'https://spdx.org/licenses/DRL-1.0.html'
  },
  'DRL-1.1': {
    isOpenSource: false,
    name: 'Detection Rule License 1.1',
    reference: 'https://spdx.org/licenses/DRL-1.1.html'
  },
  DSDP: {
    isOpenSource: false,
    name: 'DSDP License',
    reference: 'https://spdx.org/licenses/DSDP.html'
  },
  dtoa: {
    isOpenSource: false,
    name: 'David M. Gay dtoa License',
    reference: 'https://spdx.org/licenses/dtoa.html'
  },
  dvipdfm: {
    isOpenSource: false,
    name: 'dvipdfm License',
    reference: 'https://spdx.org/licenses/dvipdfm.html'
  },
  'ECL-1.0': {
    isOpenSource: true,
    name: 'Educational Community License v1.0',
    reference: 'https://spdx.org/licenses/ECL-1.0.html'
  },
  'ECL-2.0': {
    isOpenSource: true,
    name: 'Educational Community License v2.0',
    reference: 'https://spdx.org/licenses/ECL-2.0.html'
  },
  'eCos-2.0': {
    isOpenSource: true,
    name: 'eCos license version 2.0',
    reference: 'https://spdx.org/licenses/eCos-2.0.html'
  },
  'EFL-1.0': {
    isOpenSource: true,
    name: 'Eiffel Forum License v1.0',
    reference: 'https://spdx.org/licenses/EFL-1.0.html'
  },
  'EFL-2.0': {
    isOpenSource: true,
    name: 'Eiffel Forum License v2.0',
    reference: 'https://spdx.org/licenses/EFL-2.0.html'
  },
  eGenix: {
    isOpenSource: false,
    name: 'eGenix.com Public License 1.1.0',
    reference: 'https://spdx.org/licenses/eGenix.html'
  },
  'Elastic-2.0': {
    isOpenSource: false,
    name: 'Elastic License 2.0',
    reference: 'https://spdx.org/licenses/Elastic-2.0.html'
  },
  Entessa: {
    isOpenSource: true,
    name: 'Entessa Public License v1.0',
    reference: 'https://spdx.org/licenses/Entessa.html'
  },
  EPICS: {
    isOpenSource: false,
    name: 'EPICS Open License',
    reference: 'https://spdx.org/licenses/EPICS.html'
  },
  'EPL-1.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Eclipse Public License 1.0',
    reference: 'https://spdx.org/licenses/EPL-1.0.html'
  },
  'EPL-2.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Eclipse Public License 2.0',
    reference: 'https://spdx.org/licenses/EPL-2.0.html'
  },
  'ErlPL-1.1': {
    isOpenSource: false,
    name: 'Erlang Public License v1.1',
    reference: 'https://spdx.org/licenses/ErlPL-1.1.html'
  },
  'etalab-2.0': {
    isOpenSource: false,
    name: 'Etalab Open License 2.0',
    reference: 'https://spdx.org/licenses/etalab-2.0.html'
  },
  EUDatagrid: {
    isOpenSource: true,
    name: 'EU DataGrid Software License',
    reference: 'https://spdx.org/licenses/EUDatagrid.html'
  },
  'EUPL-1.0': {
    isOpenSource: false,
    name: 'European Union Public License 1.0',
    reference: 'https://spdx.org/licenses/EUPL-1.0.html'
  },
  'EUPL-1.1': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'European Union Public License 1.1',
    reference: 'https://spdx.org/licenses/EUPL-1.1.html'
  },
  'EUPL-1.2': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'European Union Public License 1.2',
    reference: 'https://spdx.org/licenses/EUPL-1.2.html'
  },
  Eurosym: {
    isOpenSource: false,
    name: 'Eurosym License',
    reference: 'https://spdx.org/licenses/Eurosym.html'
  },
  Fair: {
    isOpenSource: true,
    name: 'Fair License',
    reference: 'https://spdx.org/licenses/Fair.html'
  },
  FBM: {
    isOpenSource: false,
    name: 'Fuzzy Bitmap License',
    reference: 'https://spdx.org/licenses/FBM.html'
  },
  'FDK-AAC': {
    isOpenSource: false,
    name: 'Fraunhofer FDK AAC Codec Library',
    reference: 'https://spdx.org/licenses/FDK-AAC.html'
  },
  'Ferguson-Twofish': {
    isOpenSource: false,
    name: 'Ferguson Twofish License',
    reference: 'https://spdx.org/licenses/Ferguson-Twofish.html'
  },
  'Frameworx-1.0': {
    isOpenSource: true,
    name: 'Frameworx Open License 1.0',
    reference: 'https://spdx.org/licenses/Frameworx-1.0.html'
  },
  'FreeBSD-DOC': {
    isOpenSource: false,
    name: 'FreeBSD Documentation License',
    reference: 'https://spdx.org/licenses/FreeBSD-DOC.html'
  },
  FreeImage: {
    isOpenSource: false,
    name: 'FreeImage Public License v1.0',
    reference: 'https://spdx.org/licenses/FreeImage.html'
  },
  FSFAP: {
    isOpenSource: true,
    name: 'FSF All Permissive License',
    reference: 'https://spdx.org/licenses/FSFAP.html'
  },
  'FSFAP-no-warranty-disclaimer': {
    isOpenSource: false,
    name: 'FSF All Permissive License (without Warranty)',
    reference: 'https://spdx.org/licenses/FSFAP-no-warranty-disclaimer.html'
  },
  FSFUL: {
    isOpenSource: false,
    name: 'FSF Unlimited License',
    reference: 'https://spdx.org/licenses/FSFUL.html'
  },
  FSFULLR: {
    isOpenSource: false,
    name: 'FSF Unlimited License (with License Retention)',
    reference: 'https://spdx.org/licenses/FSFULLR.html'
  },
  FSFULLRWD: {
    isOpenSource: false,
    name: 'FSF Unlimited License (With License Retention and Warranty Disclaimer)',
    reference: 'https://spdx.org/licenses/FSFULLRWD.html'
  },
  FTL: {
    isOpenSource: true,
    name: 'Freetype Project License',
    reference: 'https://spdx.org/licenses/FTL.html'
  },
  Furuseth: {
    isOpenSource: false,
    name: 'Furuseth License',
    reference: 'https://spdx.org/licenses/Furuseth.html'
  },
  fwlw: {
    isOpenSource: false,
    name: 'fwlw License',
    reference: 'https://spdx.org/licenses/fwlw.html'
  },
  'GCR-docs': {
    isOpenSource: false,
    name: 'Gnome GCR Documentation License',
    reference: 'https://spdx.org/licenses/GCR-docs.html'
  },
  GD: {
    isOpenSource: false,
    name: 'GD License',
    reference: 'https://spdx.org/licenses/GD.html'
  },
  'GFDL-1.1': {
    isOpenSource: true,
    name: 'GNU Free Documentation License v1.1',
    reference: 'https://spdx.org/licenses/GFDL-1.1.html'
  },
  'GFDL-1.1-invariants-only': {
    isOpenSource: false,
    name: 'GNU Free Documentation License v1.1 only - invariants',
    reference: 'https://spdx.org/licenses/GFDL-1.1-invariants-only.html'
  },
  'GFDL-1.1-invariants-or-later': {
    isOpenSource: false,
    name: 'GNU Free Documentation License v1.1 or later - invariants',
    reference: 'https://spdx.org/licenses/GFDL-1.1-invariants-or-later.html'
  },
  'GFDL-1.1-no-invariants-only': {
    isOpenSource: false,
    name: 'GNU Free Documentation License v1.1 only - no invariants',
    reference: 'https://spdx.org/licenses/GFDL-1.1-no-invariants-only.html'
  },
  'GFDL-1.1-no-invariants-or-later': {
    isOpenSource: false,
    name: 'GNU Free Documentation License v1.1 or later - no invariants',
    reference: 'https://spdx.org/licenses/GFDL-1.1-no-invariants-or-later.html'
  },
  'GFDL-1.1-only': {
    isOpenSource: true,
    name: 'GNU Free Documentation License v1.1 only',
    reference: 'https://spdx.org/licenses/GFDL-1.1-only.html'
  },
  'GFDL-1.1-or-later': {
    isOpenSource: true,
    name: 'GNU Free Documentation License v1.1 or later',
    reference: 'https://spdx.org/licenses/GFDL-1.1-or-later.html'
  },
  'GFDL-1.2': {
    isOpenSource: true,
    name: 'GNU Free Documentation License v1.2',
    reference: 'https://spdx.org/licenses/GFDL-1.2.html'
  },
  'GFDL-1.2-invariants-only': {
    isOpenSource: false,
    name: 'GNU Free Documentation License v1.2 only - invariants',
    reference: 'https://spdx.org/licenses/GFDL-1.2-invariants-only.html'
  },
  'GFDL-1.2-invariants-or-later': {
    isOpenSource: false,
    name: 'GNU Free Documentation License v1.2 or later - invariants',
    reference: 'https://spdx.org/licenses/GFDL-1.2-invariants-or-later.html'
  },
  'GFDL-1.2-no-invariants-only': {
    isOpenSource: false,
    name: 'GNU Free Documentation License v1.2 only - no invariants',
    reference: 'https://spdx.org/licenses/GFDL-1.2-no-invariants-only.html'
  },
  'GFDL-1.2-no-invariants-or-later': {
    isOpenSource: false,
    name: 'GNU Free Documentation License v1.2 or later - no invariants',
    reference: 'https://spdx.org/licenses/GFDL-1.2-no-invariants-or-later.html'
  },
  'GFDL-1.2-only': {
    isOpenSource: true,
    name: 'GNU Free Documentation License v1.2 only',
    reference: 'https://spdx.org/licenses/GFDL-1.2-only.html'
  },
  'GFDL-1.2-or-later': {
    isOpenSource: true,
    name: 'GNU Free Documentation License v1.2 or later',
    reference: 'https://spdx.org/licenses/GFDL-1.2-or-later.html'
  },
  'GFDL-1.3': {
    isOpenSource: true,
    name: 'GNU Free Documentation License v1.3',
    reference: 'https://spdx.org/licenses/GFDL-1.3.html'
  },
  'GFDL-1.3-invariants-only': {
    isOpenSource: false,
    name: 'GNU Free Documentation License v1.3 only - invariants',
    reference: 'https://spdx.org/licenses/GFDL-1.3-invariants-only.html'
  },
  'GFDL-1.3-invariants-or-later': {
    isOpenSource: false,
    name: 'GNU Free Documentation License v1.3 or later - invariants',
    reference: 'https://spdx.org/licenses/GFDL-1.3-invariants-or-later.html'
  },
  'GFDL-1.3-no-invariants-only': {
    isOpenSource: false,
    name: 'GNU Free Documentation License v1.3 only - no invariants',
    reference: 'https://spdx.org/licenses/GFDL-1.3-no-invariants-only.html'
  },
  'GFDL-1.3-no-invariants-or-later': {
    isOpenSource: false,
    name: 'GNU Free Documentation License v1.3 or later - no invariants',
    reference: 'https://spdx.org/licenses/GFDL-1.3-no-invariants-or-later.html'
  },
  'GFDL-1.3-only': {
    isOpenSource: true,
    name: 'GNU Free Documentation License v1.3 only',
    reference: 'https://spdx.org/licenses/GFDL-1.3-only.html'
  },
  'GFDL-1.3-or-later': {
    isOpenSource: true,
    name: 'GNU Free Documentation License v1.3 or later',
    reference: 'https://spdx.org/licenses/GFDL-1.3-or-later.html'
  },
  Giftware: {
    isOpenSource: false,
    name: 'Giftware License',
    reference: 'https://spdx.org/licenses/Giftware.html'
  },
  GL2PS: {
    isOpenSource: false,
    name: 'GL2PS License',
    reference: 'https://spdx.org/licenses/GL2PS.html'
  },
  Glide: {
    isOpenSource: false,
    name: '3dfx Glide License',
    reference: 'https://spdx.org/licenses/Glide.html'
  },
  Glulxe: {
    isOpenSource: false,
    name: 'Glulxe License',
    reference: 'https://spdx.org/licenses/Glulxe.html'
  },
  GLWTPL: {
    isOpenSource: false,
    name: 'Good Luck With That Public License',
    reference: 'https://spdx.org/licenses/GLWTPL.html'
  },
  gnuplot: {
    isOpenSource: true,
    name: 'gnuplot License',
    reference: 'https://spdx.org/licenses/gnuplot.html'
  },
  'GPL-1.0': {
    isOpenSource: false,
    name: 'GNU General Public License v1.0 only',
    reference: 'https://spdx.org/licenses/GPL-1.0.html'
  },
  'GPL-1.0+': {
    isOpenSource: false,
    name: 'GNU General Public License v1.0 or later',
    reference: 'https://spdx.org/licenses/GPL-1.0+.html'
  },
  'GPL-1.0-only': {
    isOpenSource: false,
    name: 'GNU General Public License v1.0 only',
    reference: 'https://spdx.org/licenses/GPL-1.0-only.html'
  },
  'GPL-1.0-or-later': {
    isOpenSource: false,
    name: 'GNU General Public License v1.0 or later',
    reference: 'https://spdx.org/licenses/GPL-1.0-or-later.html'
  },
  'GPL-2.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU General Public License v2.0 only',
    reference: 'https://spdx.org/licenses/GPL-2.0.html'
  },
  'GPL-2.0+': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU General Public License v2.0 or later',
    reference: 'https://spdx.org/licenses/GPL-2.0+.html'
  },
  'GPL-2.0-only': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU General Public License v2.0 only',
    reference: 'https://spdx.org/licenses/GPL-2.0-only.html'
  },
  'GPL-2.0-or-later': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU General Public License v2.0 or later',
    reference: 'https://spdx.org/licenses/GPL-2.0-or-later.html'
  },
  'GPL-2.0-with-autoconf-exception': {
    isOpenSource: false,
    name: 'GNU General Public License v2.0 w/Autoconf exception',
    reference: 'https://spdx.org/licenses/GPL-2.0-with-autoconf-exception.html'
  },
  'GPL-2.0-with-bison-exception': {
    isOpenSource: false,
    name: 'GNU General Public License v2.0 w/Bison exception',
    reference: 'https://spdx.org/licenses/GPL-2.0-with-bison-exception.html'
  },
  'GPL-2.0-with-classpath-exception': {
    isOpenSource: false,
    name: 'GNU General Public License v2.0 w/Classpath exception',
    reference: 'https://spdx.org/licenses/GPL-2.0-with-classpath-exception.html'
  },
  'GPL-2.0-with-font-exception': {
    isOpenSource: false,
    name: 'GNU General Public License v2.0 w/Font exception',
    reference: 'https://spdx.org/licenses/GPL-2.0-with-font-exception.html'
  },
  'GPL-2.0-with-GCC-exception': {
    isOpenSource: false,
    name: 'GNU General Public License v2.0 w/GCC Runtime Library exception',
    reference: 'https://spdx.org/licenses/GPL-2.0-with-GCC-exception.html'
  },
  'GPL-3.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU General Public License v3.0 only',
    reference: 'https://spdx.org/licenses/GPL-3.0.html'
  },
  'GPL-3.0+': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU General Public License v3.0 or later',
    reference: 'https://spdx.org/licenses/GPL-3.0+.html'
  },
  'GPL-3.0-only': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU General Public License v3.0 only',
    reference: 'https://spdx.org/licenses/GPL-3.0-only.html'
  },
  'GPL-3.0-or-later': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU General Public License v3.0 or later',
    reference: 'https://spdx.org/licenses/GPL-3.0-or-later.html'
  },
  'GPL-3.0-with-autoconf-exception': {
    isOpenSource: false,
    name: 'GNU General Public License v3.0 w/Autoconf exception',
    reference: 'https://spdx.org/licenses/GPL-3.0-with-autoconf-exception.html'
  },
  'GPL-3.0-with-GCC-exception': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU General Public License v3.0 w/GCC Runtime Library exception',
    reference: 'https://spdx.org/licenses/GPL-3.0-with-GCC-exception.html'
  },
  'Graphics-Gems': {
    isOpenSource: false,
    name: 'Graphics Gems License',
    reference: 'https://spdx.org/licenses/Graphics-Gems.html'
  },
  'gSOAP-1.3b': {
    isOpenSource: false,
    name: 'gSOAP Public License v1.3b',
    reference: 'https://spdx.org/licenses/gSOAP-1.3b.html'
  },
  HaskellReport: {
    isOpenSource: false,
    name: 'Haskell Language Report License',
    reference: 'https://spdx.org/licenses/HaskellReport.html'
  },
  hdparm: {
    isOpenSource: false,
    name: 'hdparm License',
    reference: 'https://spdx.org/licenses/hdparm.html'
  },
  'Hippocratic-2.1': {
    isOpenSource: false,
    name: 'Hippocratic License 2.1',
    reference: 'https://spdx.org/licenses/Hippocratic-2.1.html'
  },
  'HP-1986': {
    isOpenSource: false,
    name: 'Hewlett-Packard 1986 License',
    reference: 'https://spdx.org/licenses/HP-1986.html'
  },
  'HP-1989': {
    isOpenSource: false,
    name: 'Hewlett-Packard 1989 License',
    reference: 'https://spdx.org/licenses/HP-1989.html'
  },
  HPND: {
    isOpenSource: true,
    name: 'Historical Permission Notice and Disclaimer',
    reference: 'https://spdx.org/licenses/HPND.html'
  },
  'HPND-DEC': {
    isOpenSource: false,
    name: 'Historical Permission Notice and Disclaimer - DEC variant',
    reference: 'https://spdx.org/licenses/HPND-DEC.html'
  },
  'HPND-doc': {
    isOpenSource: false,
    name: 'Historical Permission Notice and Disclaimer - documentation variant',
    reference: 'https://spdx.org/licenses/HPND-doc.html'
  },
  'HPND-doc-sell': {
    isOpenSource: false,
    name: 'Historical Permission Notice and Disclaimer - documentation sell variant',
    reference: 'https://spdx.org/licenses/HPND-doc-sell.html'
  },
  'HPND-export-US': {
    isOpenSource: false,
    name: 'HPND with US Government export control warning',
    reference: 'https://spdx.org/licenses/HPND-export-US.html'
  },
  'HPND-export-US-modify': {
    isOpenSource: false,
    name: 'HPND with US Government export control warning and modification rqmt',
    reference: 'https://spdx.org/licenses/HPND-export-US-modify.html'
  },
  'HPND-Kevlin-Henney': {
    isOpenSource: false,
    name: 'Historical Permission Notice and Disclaimer - Kevlin Henney variant',
    reference: 'https://spdx.org/licenses/HPND-Kevlin-Henney.html'
  },
  'HPND-Markus-Kuhn': {
    isOpenSource: false,
    name: 'Historical Permission Notice and Disclaimer - Markus Kuhn variant',
    reference: 'https://spdx.org/licenses/HPND-Markus-Kuhn.html'
  },
  'HPND-MIT-disclaimer': {
    isOpenSource: false,
    name: 'Historical Permission Notice and Disclaimer with MIT disclaimer',
    reference: 'https://spdx.org/licenses/HPND-MIT-disclaimer.html'
  },
  'HPND-Pbmplus': {
    isOpenSource: false,
    name: 'Historical Permission Notice and Disclaimer - Pbmplus variant',
    reference: 'https://spdx.org/licenses/HPND-Pbmplus.html'
  },
  'HPND-sell-MIT-disclaimer-xserver': {
    isOpenSource: false,
    name: 'Historical Permission Notice and Disclaimer - sell xserver variant with MIT disclaimer',
    reference: 'https://spdx.org/licenses/HPND-sell-MIT-disclaimer-xserver.html'
  },
  'HPND-sell-regexpr': {
    isOpenSource: false,
    name: 'Historical Permission Notice and Disclaimer - sell regexpr variant',
    reference: 'https://spdx.org/licenses/HPND-sell-regexpr.html'
  },
  'HPND-sell-variant': {
    isOpenSource: false,
    name: 'Historical Permission Notice and Disclaimer - sell variant',
    reference: 'https://spdx.org/licenses/HPND-sell-variant.html'
  },
  'HPND-sell-variant-MIT-disclaimer': {
    isOpenSource: false,
    name: 'HPND sell variant with MIT disclaimer',
    reference: 'https://spdx.org/licenses/HPND-sell-variant-MIT-disclaimer.html'
  },
  'HPND-UC': {
    isOpenSource: false,
    name: 'Historical Permission Notice and Disclaimer - University of California variant',
    reference: 'https://spdx.org/licenses/HPND-UC.html'
  },
  HTMLTIDY: {
    isOpenSource: false,
    name: 'HTML Tidy License',
    reference: 'https://spdx.org/licenses/HTMLTIDY.html'
  },
  'IBM-pibs': {
    isOpenSource: false,
    name: 'IBM PowerPC Initialization and Boot Software',
    reference: 'https://spdx.org/licenses/IBM-pibs.html'
  },
  ICU: {
    isOpenSource: true,
    name: 'ICU License',
    reference: 'https://spdx.org/licenses/ICU.html'
  },
  'IEC-Code-Components-EULA': {
    isOpenSource: false,
    name: 'IEC    Code Components End-user licence agreement',
    reference: 'https://spdx.org/licenses/IEC-Code-Components-EULA.html'
  },
  IJG: {
    isOpenSource: true,
    name: 'Independent JPEG Group License',
    reference: 'https://spdx.org/licenses/IJG.html'
  },
  'IJG-short': {
    isOpenSource: false,
    name: 'Independent JPEG Group License - short',
    reference: 'https://spdx.org/licenses/IJG-short.html'
  },
  ImageMagick: {
    isOpenSource: false,
    name: 'ImageMagick License',
    reference: 'https://spdx.org/licenses/ImageMagick.html'
  },
  iMatix: {
    isOpenSource: true,
    name: 'iMatix Standard Function Library Agreement',
    reference: 'https://spdx.org/licenses/iMatix.html'
  },
  Imlib2: {
    isOpenSource: true,
    name: 'Imlib2 License',
    reference: 'https://spdx.org/licenses/Imlib2.html'
  },
  'Info-ZIP': {
    isOpenSource: false,
    name: 'Info-ZIP License',
    reference: 'https://spdx.org/licenses/Info-ZIP.html'
  },
  'Inner-Net-2.0': {
    isOpenSource: false,
    name: 'Inner Net License v2.0',
    reference: 'https://spdx.org/licenses/Inner-Net-2.0.html'
  },
  Intel: {
    isOpenSource: true,
    name: 'Intel Open Source License',
    reference: 'https://spdx.org/licenses/Intel.html'
  },
  'Intel-ACPI': {
    isOpenSource: false,
    name: 'Intel ACPI Software License Agreement',
    reference: 'https://spdx.org/licenses/Intel-ACPI.html'
  },
  'Interbase-1.0': {
    isOpenSource: false,
    name: 'Interbase Public License v1.0',
    reference: 'https://spdx.org/licenses/Interbase-1.0.html'
  },
  IPA: {
    isOpenSource: true,
    name: 'IPA Font License',
    reference: 'https://spdx.org/licenses/IPA.html'
  },
  'IPL-1.0': {
    isOpenSource: true,
    name: 'IBM Public License v1.0',
    reference: 'https://spdx.org/licenses/IPL-1.0.html'
  },
  ISC: {
    isOpenSource: true,
    name: 'ISC License',
    reference: 'https://spdx.org/licenses/ISC.html'
  },
  'ISC-Veillard': {
    isOpenSource: false,
    name: 'ISC Veillard variant',
    reference: 'https://spdx.org/licenses/ISC-Veillard.html'
  },
  Jam: {
    isOpenSource: true,
    name: 'Jam License',
    reference: 'https://spdx.org/licenses/Jam.html'
  },
  'JasPer-2.0': {
    isOpenSource: false,
    name: 'JasPer License',
    reference: 'https://spdx.org/licenses/JasPer-2.0.html'
  },
  'JPL-image': {
    isOpenSource: false,
    name: 'JPL Image Use Policy',
    reference: 'https://spdx.org/licenses/JPL-image.html'
  },
  JPNIC: {
    isOpenSource: false,
    name: 'Japan Network Information Center License',
    reference: 'https://spdx.org/licenses/JPNIC.html'
  },
  JSON: {
    isOpenSource: false,
    name: 'JSON License',
    reference: 'https://spdx.org/licenses/JSON.html'
  },
  Kastrup: {
    isOpenSource: false,
    name: 'Kastrup License',
    reference: 'https://spdx.org/licenses/Kastrup.html'
  },
  Kazlib: {
    isOpenSource: false,
    name: 'Kazlib License',
    reference: 'https://spdx.org/licenses/Kazlib.html'
  },
  'Knuth-CTAN': {
    isOpenSource: false,
    name: 'Knuth CTAN License',
    reference: 'https://spdx.org/licenses/Knuth-CTAN.html'
  },
  'LAL-1.2': {
    isOpenSource: false,
    name: 'Licence Art Libre 1.2',
    reference: 'https://spdx.org/licenses/LAL-1.2.html'
  },
  'LAL-1.3': {
    isOpenSource: false,
    name: 'Licence Art Libre 1.3',
    reference: 'https://spdx.org/licenses/LAL-1.3.html'
  },
  Latex2e: {
    isOpenSource: false,
    name: 'Latex2e License',
    reference: 'https://spdx.org/licenses/Latex2e.html'
  },
  'Latex2e-translated-notice': {
    isOpenSource: false,
    name: 'Latex2e with translated notice permission',
    reference: 'https://spdx.org/licenses/Latex2e-translated-notice.html'
  },
  Leptonica: {
    isOpenSource: false,
    name: 'Leptonica License',
    reference: 'https://spdx.org/licenses/Leptonica.html'
  },
  'LGPL-2.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU Library General Public License v2 only',
    reference: 'https://spdx.org/licenses/LGPL-2.0.html'
  },
  'LGPL-2.0+': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU Library General Public License v2 or later',
    reference: 'https://spdx.org/licenses/LGPL-2.0+.html'
  },
  'LGPL-2.0-only': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU Library General Public License v2 only',
    reference: 'https://spdx.org/licenses/LGPL-2.0-only.html'
  },
  'LGPL-2.0-or-later': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU Library General Public License v2 or later',
    reference: 'https://spdx.org/licenses/LGPL-2.0-or-later.html'
  },
  'LGPL-2.1': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU Lesser General Public License v2.1 only',
    reference: 'https://spdx.org/licenses/LGPL-2.1.html'
  },
  'LGPL-2.1+': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU Lesser General Public License v2.1 or later',
    reference: 'https://spdx.org/licenses/LGPL-2.1+.html'
  },
  'LGPL-2.1-only': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU Lesser General Public License v2.1 only',
    reference: 'https://spdx.org/licenses/LGPL-2.1-only.html'
  },
  'LGPL-2.1-or-later': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU Lesser General Public License v2.1 or later',
    reference: 'https://spdx.org/licenses/LGPL-2.1-or-later.html'
  },
  'LGPL-3.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU Lesser General Public License v3.0 only',
    reference: 'https://spdx.org/licenses/LGPL-3.0.html'
  },
  'LGPL-3.0+': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU Lesser General Public License v3.0 or later',
    reference: 'https://spdx.org/licenses/LGPL-3.0+.html'
  },
  'LGPL-3.0-only': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU Lesser General Public License v3.0 only',
    reference: 'https://spdx.org/licenses/LGPL-3.0-only.html'
  },
  'LGPL-3.0-or-later': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'GNU Lesser General Public License v3.0 or later',
    reference: 'https://spdx.org/licenses/LGPL-3.0-or-later.html'
  },
  LGPLLR: {
    isOpenSource: false,
    name: 'Lesser General Public License For Linguistic Resources',
    reference: 'https://spdx.org/licenses/LGPLLR.html'
  },
  Libpng: {
    isOpenSource: false,
    name: 'libpng License',
    reference: 'https://spdx.org/licenses/Libpng.html'
  },
  'libpng-2.0': {
    isOpenSource: false,
    name: 'PNG Reference Library version 2',
    reference: 'https://spdx.org/licenses/libpng-2.0.html'
  },
  'libselinux-1.0': {
    isOpenSource: false,
    name: 'libselinux public domain notice',
    reference: 'https://spdx.org/licenses/libselinux-1.0.html'
  },
  libtiff: {
    isOpenSource: false,
    name: 'libtiff License',
    reference: 'https://spdx.org/licenses/libtiff.html'
  },
  'libutil-David-Nugent': {
    isOpenSource: false,
    name: 'libutil David Nugent License',
    reference: 'https://spdx.org/licenses/libutil-David-Nugent.html'
  },
  'LiLiQ-P-1.1': {
    isOpenSource: true,
    name: 'Licence Libre du Québec – Permissive version 1.1',
    reference: 'https://spdx.org/licenses/LiLiQ-P-1.1.html'
  },
  'LiLiQ-R-1.1': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Licence Libre du Québec – Réciprocité version 1.1',
    reference: 'https://spdx.org/licenses/LiLiQ-R-1.1.html'
  },
  'LiLiQ-Rplus-1.1': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Licence Libre du Québec – Réciprocité forte version 1.1',
    reference: 'https://spdx.org/licenses/LiLiQ-Rplus-1.1.html'
  },
  'Linux-man-pages-1-para': {
    isOpenSource: false,
    name: 'Linux man-pages - 1 paragraph',
    reference: 'https://spdx.org/licenses/Linux-man-pages-1-para.html'
  },
  'Linux-man-pages-copyleft': {
    isOpenSource: false,
    name: 'Linux man-pages Copyleft',
    reference: 'https://spdx.org/licenses/Linux-man-pages-copyleft.html'
  },
  'Linux-man-pages-copyleft-2-para': {
    isOpenSource: false,
    name: 'Linux man-pages Copyleft - 2 paragraphs',
    reference: 'https://spdx.org/licenses/Linux-man-pages-copyleft-2-para.html'
  },
  'Linux-man-pages-copyleft-var': {
    isOpenSource: false,
    name: 'Linux man-pages Copyleft Variant',
    reference: 'https://spdx.org/licenses/Linux-man-pages-copyleft-var.html'
  },
  'Linux-OpenIB': {
    isOpenSource: false,
    name: 'Linux Kernel Variant of OpenIB.org license',
    reference: 'https://spdx.org/licenses/Linux-OpenIB.html'
  },
  LOOP: {
    isOpenSource: false,
    name: 'Common Lisp LOOP License',
    reference: 'https://spdx.org/licenses/LOOP.html'
  },
  'LPD-document': {
    isOpenSource: false,
    name: 'LPD Documentation License',
    reference: 'https://spdx.org/licenses/LPD-document.html'
  },
  'LPL-1.0': {
    isOpenSource: true,
    name: 'Lucent Public License Version 1.0',
    reference: 'https://spdx.org/licenses/LPL-1.0.html'
  },
  'LPL-1.02': {
    isOpenSource: true,
    name: 'Lucent Public License v1.02',
    reference: 'https://spdx.org/licenses/LPL-1.02.html'
  },
  'LPPL-1.0': {
    isOpenSource: false,
    name: 'LaTeX Project Public License v1.0',
    reference: 'https://spdx.org/licenses/LPPL-1.0.html'
  },
  'LPPL-1.1': {
    isOpenSource: false,
    name: 'LaTeX Project Public License v1.1',
    reference: 'https://spdx.org/licenses/LPPL-1.1.html'
  },
  'LPPL-1.2': {
    isOpenSource: true,
    name: 'LaTeX Project Public License v1.2',
    reference: 'https://spdx.org/licenses/LPPL-1.2.html'
  },
  'LPPL-1.3a': {
    isOpenSource: true,
    name: 'LaTeX Project Public License v1.3a',
    reference: 'https://spdx.org/licenses/LPPL-1.3a.html'
  },
  'LPPL-1.3c': {
    isOpenSource: true,
    name: 'LaTeX Project Public License v1.3c',
    reference: 'https://spdx.org/licenses/LPPL-1.3c.html'
  },
  lsof: {
    isOpenSource: false,
    name: 'lsof License',
    reference: 'https://spdx.org/licenses/lsof.html'
  },
  'Lucida-Bitmap-Fonts': {
    isOpenSource: false,
    name: 'Lucida Bitmap Fonts License',
    reference: 'https://spdx.org/licenses/Lucida-Bitmap-Fonts.html'
  },
  'LZMA-SDK-9.11-to-9.20': {
    isOpenSource: false,
    name: 'LZMA SDK License (versions 9.11 to 9.20)',
    reference: 'https://spdx.org/licenses/LZMA-SDK-9.11-to-9.20.html'
  },
  'LZMA-SDK-9.22': {
    isOpenSource: false,
    name: 'LZMA SDK License (versions 9.22 and beyond)',
    reference: 'https://spdx.org/licenses/LZMA-SDK-9.22.html'
  },
  magaz: {
    isOpenSource: false,
    name: 'magaz License',
    reference: 'https://spdx.org/licenses/magaz.html'
  },
  mailprio: {
    isOpenSource: false,
    name: 'mailprio License',
    reference: 'https://spdx.org/licenses/mailprio.html'
  },
  MakeIndex: {
    isOpenSource: false,
    name: 'MakeIndex License',
    reference: 'https://spdx.org/licenses/MakeIndex.html'
  },
  'Martin-Birgmeier': {
    isOpenSource: false,
    name: 'Martin Birgmeier License',
    reference: 'https://spdx.org/licenses/Martin-Birgmeier.html'
  },
  'McPhee-slideshow': {
    isOpenSource: false,
    name: 'McPhee Slideshow License',
    reference: 'https://spdx.org/licenses/McPhee-slideshow.html'
  },
  metamail: {
    isOpenSource: false,
    name: 'metamail License',
    reference: 'https://spdx.org/licenses/metamail.html'
  },
  Minpack: {
    isOpenSource: false,
    name: 'Minpack License',
    reference: 'https://spdx.org/licenses/Minpack.html'
  },
  MirOS: {
    isOpenSource: true,
    name: 'The MirOS Licence',
    reference: 'https://spdx.org/licenses/MirOS.html'
  },
  MIT: {
    isOpenSource: true,
    name: 'MIT License',
    reference: 'https://spdx.org/licenses/MIT.html'
  },
  'MIT-0': {
    isOpenSource: true,
    name: 'MIT No Attribution',
    reference: 'https://spdx.org/licenses/MIT-0.html'
  },
  'MIT-advertising': {
    isOpenSource: false,
    name: 'Enlightenment License (e16)',
    reference: 'https://spdx.org/licenses/MIT-advertising.html'
  },
  'MIT-CMU': {
    isOpenSource: false,
    name: 'CMU License',
    reference: 'https://spdx.org/licenses/MIT-CMU.html'
  },
  'MIT-enna': {
    isOpenSource: false,
    name: 'enna License',
    reference: 'https://spdx.org/licenses/MIT-enna.html'
  },
  'MIT-feh': {
    isOpenSource: false,
    name: 'feh License',
    reference: 'https://spdx.org/licenses/MIT-feh.html'
  },
  'MIT-Festival': {
    isOpenSource: false,
    name: 'MIT Festival Variant',
    reference: 'https://spdx.org/licenses/MIT-Festival.html'
  },
  'MIT-Modern-Variant': {
    isOpenSource: true,
    name: 'MIT License Modern Variant',
    reference: 'https://spdx.org/licenses/MIT-Modern-Variant.html'
  },
  'MIT-open-group': {
    isOpenSource: false,
    name: 'MIT Open Group variant',
    reference: 'https://spdx.org/licenses/MIT-open-group.html'
  },
  'MIT-testregex': {
    isOpenSource: false,
    name: 'MIT testregex Variant',
    reference: 'https://spdx.org/licenses/MIT-testregex.html'
  },
  'MIT-Wu': {
    isOpenSource: false,
    name: 'MIT Tom Wu Variant',
    reference: 'https://spdx.org/licenses/MIT-Wu.html'
  },
  MITNFA: {
    isOpenSource: false,
    name: 'MIT +no-false-attribs license',
    reference: 'https://spdx.org/licenses/MITNFA.html'
  },
  MMIXware: {
    isOpenSource: false,
    name: 'MMIXware License',
    reference: 'https://spdx.org/licenses/MMIXware.html'
  },
  Motosoto: {
    isOpenSource: true,
    name: 'Motosoto License',
    reference: 'https://spdx.org/licenses/Motosoto.html'
  },
  'MPEG-SSG': {
    isOpenSource: false,
    name: 'MPEG Software Simulation',
    reference: 'https://spdx.org/licenses/MPEG-SSG.html'
  },
  'mpi-permissive': {
    isOpenSource: false,
    name: 'mpi Permissive License',
    reference: 'https://spdx.org/licenses/mpi-permissive.html'
  },
  mpich2: {
    isOpenSource: false,
    name: 'mpich2 License',
    reference: 'https://spdx.org/licenses/mpich2.html'
  },
  'MPL-1.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Mozilla Public License 1.0',
    reference: 'https://spdx.org/licenses/MPL-1.0.html'
  },
  'MPL-1.1': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Mozilla Public License 1.1',
    reference: 'https://spdx.org/licenses/MPL-1.1.html'
  },
  'MPL-2.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Mozilla Public License 2.0',
    reference: 'https://spdx.org/licenses/MPL-2.0.html'
  },
  'MPL-2.0-no-copyleft-exception': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Mozilla Public License 2.0 (no copyleft exception)',
    reference: 'https://spdx.org/licenses/MPL-2.0-no-copyleft-exception.html'
  },
  mplus: {
    isOpenSource: false,
    name: 'mplus Font License',
    reference: 'https://spdx.org/licenses/mplus.html'
  },
  'MS-LPL': {
    isOpenSource: false,
    name: 'Microsoft Limited Public License',
    reference: 'https://spdx.org/licenses/MS-LPL.html'
  },
  'MS-PL': {
    isOpenSource: true,
    name: 'Microsoft Public License',
    reference: 'https://spdx.org/licenses/MS-PL.html'
  },
  'MS-RL': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Microsoft Reciprocal License',
    reference: 'https://spdx.org/licenses/MS-RL.html'
  },
  MTLL: {
    isOpenSource: false,
    name: 'Matrix Template Library License',
    reference: 'https://spdx.org/licenses/MTLL.html'
  },
  'MulanPSL-1.0': {
    isOpenSource: false,
    name: 'Mulan Permissive Software License, Version 1',
    reference: 'https://spdx.org/licenses/MulanPSL-1.0.html'
  },
  'MulanPSL-2.0': {
    isOpenSource: true,
    name: 'Mulan Permissive Software License, Version 2',
    reference: 'https://spdx.org/licenses/MulanPSL-2.0.html'
  },
  Multics: {
    isOpenSource: true,
    name: 'Multics License',
    reference: 'https://spdx.org/licenses/Multics.html'
  },
  Mup: {
    isOpenSource: false,
    name: 'Mup License',
    reference: 'https://spdx.org/licenses/Mup.html'
  },
  'NAIST-2003': {
    isOpenSource: false,
    name: 'Nara Institute of Science and Technology License (2003)',
    reference: 'https://spdx.org/licenses/NAIST-2003.html'
  },
  'NASA-1.3': {
    isOpenSource: true,
    name: 'NASA Open Source Agreement 1.3',
    reference: 'https://spdx.org/licenses/NASA-1.3.html'
  },
  Naumen: {
    isOpenSource: true,
    name: 'Naumen Public License',
    reference: 'https://spdx.org/licenses/Naumen.html'
  },
  'NBPL-1.0': {
    isOpenSource: false,
    name: 'Net Boolean Public License v1',
    reference: 'https://spdx.org/licenses/NBPL-1.0.html'
  },
  'NCGL-UK-2.0': {
    isOpenSource: false,
    name: 'Non-Commercial Government Licence',
    reference: 'https://spdx.org/licenses/NCGL-UK-2.0.html'
  },
  NCSA: {
    isOpenSource: true,
    name: 'University of Illinois/NCSA Open Source License',
    reference: 'https://spdx.org/licenses/NCSA.html'
  },
  'Net-SNMP': {
    isOpenSource: false,
    name: 'Net-SNMP License',
    reference: 'https://spdx.org/licenses/Net-SNMP.html'
  },
  NetCDF: {
    isOpenSource: false,
    name: 'NetCDF license',
    reference: 'https://spdx.org/licenses/NetCDF.html'
  },
  Newsletr: {
    isOpenSource: false,
    name: 'Newsletr License',
    reference: 'https://spdx.org/licenses/Newsletr.html'
  },
  NGPL: {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Nethack General Public License',
    reference: 'https://spdx.org/licenses/NGPL.html'
  },
  'NICTA-1.0': {
    isOpenSource: false,
    name: 'NICTA Public Software License, Version 1.0',
    reference: 'https://spdx.org/licenses/NICTA-1.0.html'
  },
  'NIST-PD': {
    isOpenSource: false,
    name: 'NIST Public Domain Notice',
    reference: 'https://spdx.org/licenses/NIST-PD.html'
  },
  'NIST-PD-fallback': {
    isOpenSource: false,
    name: 'NIST Public Domain Notice with license fallback',
    reference: 'https://spdx.org/licenses/NIST-PD-fallback.html'
  },
  'NIST-Software': {
    isOpenSource: false,
    name: 'NIST Software License',
    reference: 'https://spdx.org/licenses/NIST-Software.html'
  },
  'NLOD-1.0': {
    isOpenSource: false,
    name: 'Norwegian Licence for Open Government Data (NLOD) 1.0',
    reference: 'https://spdx.org/licenses/NLOD-1.0.html'
  },
  'NLOD-2.0': {
    isOpenSource: false,
    name: 'Norwegian Licence for Open Government Data (NLOD) 2.0',
    reference: 'https://spdx.org/licenses/NLOD-2.0.html'
  },
  NLPL: {
    isOpenSource: false,
    name: 'No Limit Public License',
    reference: 'https://spdx.org/licenses/NLPL.html'
  },
  Nokia: {
    isOpenSource: true,
    name: 'Nokia Open Source License',
    reference: 'https://spdx.org/licenses/Nokia.html'
  },
  NOSL: {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Netizen Open Source License',
    reference: 'https://spdx.org/licenses/NOSL.html'
  },
  Noweb: {
    isOpenSource: false,
    name: 'Noweb License',
    reference: 'https://spdx.org/licenses/Noweb.html'
  },
  'NPL-1.0': {
    isOpenSource: true,
    name: 'Netscape Public License v1.0',
    reference: 'https://spdx.org/licenses/NPL-1.0.html'
  },
  'NPL-1.1': {
    isOpenSource: true,
    name: 'Netscape Public License v1.1',
    reference: 'https://spdx.org/licenses/NPL-1.1.html'
  },
  'NPOSL-3.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Non-Profit Open Software License 3.0',
    reference: 'https://spdx.org/licenses/NPOSL-3.0.html'
  },
  NRL: {
    isOpenSource: false,
    name: 'NRL License',
    reference: 'https://spdx.org/licenses/NRL.html'
  },
  NTP: {
    isOpenSource: true,
    name: 'NTP License',
    reference: 'https://spdx.org/licenses/NTP.html'
  },
  'NTP-0': {
    isOpenSource: false,
    name: 'NTP No Attribution',
    reference: 'https://spdx.org/licenses/NTP-0.html'
  },
  Nunit: {
    isOpenSource: true,
    name: 'Nunit License',
    reference: 'https://spdx.org/licenses/Nunit.html'
  },
  'O-UDA-1.0': {
    isOpenSource: false,
    name: 'Open Use of Data Agreement v1.0',
    reference: 'https://spdx.org/licenses/O-UDA-1.0.html'
  },
  'OCCT-PL': {
    isOpenSource: false,
    name: 'Open CASCADE Technology Public License',
    reference: 'https://spdx.org/licenses/OCCT-PL.html'
  },
  'OCLC-2.0': {
    isOpenSource: true,
    name: 'OCLC Research Public License 2.0',
    reference: 'https://spdx.org/licenses/OCLC-2.0.html'
  },
  'ODbL-1.0': {
    isOpenSource: true,
    name: 'Open Data Commons Open Database License v1.0',
    reference: 'https://spdx.org/licenses/ODbL-1.0.html'
  },
  'ODC-By-1.0': {
    isOpenSource: false,
    name: 'Open Data Commons Attribution License v1.0',
    reference: 'https://spdx.org/licenses/ODC-By-1.0.html'
  },
  OFFIS: {
    isOpenSource: false,
    name: 'OFFIS License',
    reference: 'https://spdx.org/licenses/OFFIS.html'
  },
  'OFL-1.0': {
    isOpenSource: true,
    name: 'SIL Open Font License 1.0',
    reference: 'https://spdx.org/licenses/OFL-1.0.html'
  },
  'OFL-1.0-no-RFN': {
    isOpenSource: false,
    name: 'SIL Open Font License 1.0 with no Reserved Font Name',
    reference: 'https://spdx.org/licenses/OFL-1.0-no-RFN.html'
  },
  'OFL-1.0-RFN': {
    isOpenSource: false,
    name: 'SIL Open Font License 1.0 with Reserved Font Name',
    reference: 'https://spdx.org/licenses/OFL-1.0-RFN.html'
  },
  'OFL-1.1': {
    isOpenSource: true,
    name: 'SIL Open Font License 1.1',
    reference: 'https://spdx.org/licenses/OFL-1.1.html'
  },
  'OFL-1.1-no-RFN': {
    isOpenSource: true,
    name: 'SIL Open Font License 1.1 with no Reserved Font Name',
    reference: 'https://spdx.org/licenses/OFL-1.1-no-RFN.html'
  },
  'OFL-1.1-RFN': {
    isOpenSource: true,
    name: 'SIL Open Font License 1.1 with Reserved Font Name',
    reference: 'https://spdx.org/licenses/OFL-1.1-RFN.html'
  },
  'OGC-1.0': {
    isOpenSource: false,
    name: 'OGC Software License, Version 1.0',
    reference: 'https://spdx.org/licenses/OGC-1.0.html'
  },
  'OGDL-Taiwan-1.0': {
    isOpenSource: false,
    name: 'Taiwan Open Government Data License, version 1.0',
    reference: 'https://spdx.org/licenses/OGDL-Taiwan-1.0.html'
  },
  'OGL-Canada-2.0': {
    isOpenSource: false,
    name: 'Open Government Licence - Canada',
    reference: 'https://spdx.org/licenses/OGL-Canada-2.0.html'
  },
  'OGL-UK-1.0': {
    isOpenSource: false,
    name: 'Open Government Licence v1.0',
    reference: 'https://spdx.org/licenses/OGL-UK-1.0.html'
  },
  'OGL-UK-2.0': {
    isOpenSource: false,
    name: 'Open Government Licence v2.0',
    reference: 'https://spdx.org/licenses/OGL-UK-2.0.html'
  },
  'OGL-UK-3.0': {
    isOpenSource: false,
    name: 'Open Government Licence v3.0',
    reference: 'https://spdx.org/licenses/OGL-UK-3.0.html'
  },
  OGTSL: {
    isOpenSource: true,
    name: 'Open Group Test Suite License',
    reference: 'https://spdx.org/licenses/OGTSL.html'
  },
  'OLDAP-1.1': {
    isOpenSource: false,
    name: 'Open LDAP Public License v1.1',
    reference: 'https://spdx.org/licenses/OLDAP-1.1.html'
  },
  'OLDAP-1.2': {
    isOpenSource: false,
    name: 'Open LDAP Public License v1.2',
    reference: 'https://spdx.org/licenses/OLDAP-1.2.html'
  },
  'OLDAP-1.3': {
    isOpenSource: false,
    name: 'Open LDAP Public License v1.3',
    reference: 'https://spdx.org/licenses/OLDAP-1.3.html'
  },
  'OLDAP-1.4': {
    isOpenSource: false,
    name: 'Open LDAP Public License v1.4',
    reference: 'https://spdx.org/licenses/OLDAP-1.4.html'
  },
  'OLDAP-2.0': {
    isOpenSource: false,
    name: 'Open LDAP Public License v2.0 (or possibly 2.0A and 2.0B)',
    reference: 'https://spdx.org/licenses/OLDAP-2.0.html'
  },
  'OLDAP-2.0.1': {
    isOpenSource: false,
    name: 'Open LDAP Public License v2.0.1',
    reference: 'https://spdx.org/licenses/OLDAP-2.0.1.html'
  },
  'OLDAP-2.1': {
    isOpenSource: false,
    name: 'Open LDAP Public License v2.1',
    reference: 'https://spdx.org/licenses/OLDAP-2.1.html'
  },
  'OLDAP-2.2': {
    isOpenSource: false,
    name: 'Open LDAP Public License v2.2',
    reference: 'https://spdx.org/licenses/OLDAP-2.2.html'
  },
  'OLDAP-2.2.1': {
    isOpenSource: false,
    name: 'Open LDAP Public License v2.2.1',
    reference: 'https://spdx.org/licenses/OLDAP-2.2.1.html'
  },
  'OLDAP-2.2.2': {
    isOpenSource: false,
    name: 'Open LDAP Public License 2.2.2',
    reference: 'https://spdx.org/licenses/OLDAP-2.2.2.html'
  },
  'OLDAP-2.3': {
    isOpenSource: true,
    name: 'Open LDAP Public License v2.3',
    reference: 'https://spdx.org/licenses/OLDAP-2.3.html'
  },
  'OLDAP-2.4': {
    isOpenSource: false,
    name: 'Open LDAP Public License v2.4',
    reference: 'https://spdx.org/licenses/OLDAP-2.4.html'
  },
  'OLDAP-2.5': {
    isOpenSource: false,
    name: 'Open LDAP Public License v2.5',
    reference: 'https://spdx.org/licenses/OLDAP-2.5.html'
  },
  'OLDAP-2.6': {
    isOpenSource: false,
    name: 'Open LDAP Public License v2.6',
    reference: 'https://spdx.org/licenses/OLDAP-2.6.html'
  },
  'OLDAP-2.7': {
    isOpenSource: true,
    name: 'Open LDAP Public License v2.7',
    reference: 'https://spdx.org/licenses/OLDAP-2.7.html'
  },
  'OLDAP-2.8': {
    isOpenSource: true,
    name: 'Open LDAP Public License v2.8',
    reference: 'https://spdx.org/licenses/OLDAP-2.8.html'
  },
  'OLFL-1.3': {
    isOpenSource: true,
    name: 'Open Logistics Foundation License Version 1.3',
    reference: 'https://spdx.org/licenses/OLFL-1.3.html'
  },
  OML: {
    isOpenSource: false,
    name: 'Open Market License',
    reference: 'https://spdx.org/licenses/OML.html'
  },
  'OpenPBS-2.3': {
    isOpenSource: false,
    name: 'OpenPBS v2.3 Software License',
    reference: 'https://spdx.org/licenses/OpenPBS-2.3.html'
  },
  OpenSSL: {
    isOpenSource: true,
    name: 'OpenSSL License',
    reference: 'https://spdx.org/licenses/OpenSSL.html'
  },
  'OPL-1.0': {
    isOpenSource: false,
    name: 'Open Public License v1.0',
    reference: 'https://spdx.org/licenses/OPL-1.0.html'
  },
  'OPL-UK-3.0': {
    isOpenSource: false,
    name: 'United    Kingdom Open Parliament Licence v3.0',
    reference: 'https://spdx.org/licenses/OPL-UK-3.0.html'
  },
  'OPUBL-1.0': {
    isOpenSource: false,
    name: 'Open Publication License v1.0',
    reference: 'https://spdx.org/licenses/OPUBL-1.0.html'
  },
  'OSET-PL-2.1': {
    isOpenSource: true,
    name: 'OSET Public License version 2.1',
    reference: 'https://spdx.org/licenses/OSET-PL-2.1.html'
  },
  'OSL-1.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Open Software License 1.0',
    reference: 'https://spdx.org/licenses/OSL-1.0.html'
  },
  'OSL-1.1': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Open Software License 1.1',
    reference: 'https://spdx.org/licenses/OSL-1.1.html'
  },
  'OSL-2.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Open Software License 2.0',
    reference: 'https://spdx.org/licenses/OSL-2.0.html'
  },
  'OSL-2.1': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Open Software License 2.1',
    reference: 'https://spdx.org/licenses/OSL-2.1.html'
  },
  'OSL-3.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Open Software License 3.0',
    reference: 'https://spdx.org/licenses/OSL-3.0.html'
  },
  PADL: {
    isOpenSource: false,
    name: 'PADL License',
    reference: 'https://spdx.org/licenses/PADL.html'
  },
  'Parity-6.0.0': {
    isOpenSource: false,
    name: 'The Parity Public License 6.0.0',
    reference: 'https://spdx.org/licenses/Parity-6.0.0.html'
  },
  'Parity-7.0.0': {
    isOpenSource: false,
    name: 'The Parity Public License 7.0.0',
    reference: 'https://spdx.org/licenses/Parity-7.0.0.html'
  },
  'PDDL-1.0': {
    isOpenSource: false,
    name: 'Open Data Commons Public Domain Dedication & License 1.0',
    reference: 'https://spdx.org/licenses/PDDL-1.0.html'
  },
  'PHP-3.0': {
    isOpenSource: true,
    name: 'PHP License v3.0',
    reference: 'https://spdx.org/licenses/PHP-3.0.html'
  },
  'PHP-3.01': {
    isOpenSource: true,
    name: 'PHP License v3.01',
    reference: 'https://spdx.org/licenses/PHP-3.01.html'
  },
  Pixar: {
    isOpenSource: false,
    name: 'Pixar License',
    reference: 'https://spdx.org/licenses/Pixar.html'
  },
  Plexus: {
    isOpenSource: false,
    name: 'Plexus Classworlds License',
    reference: 'https://spdx.org/licenses/Plexus.html'
  },
  pnmstitch: {
    isOpenSource: false,
    name: 'pnmstitch License',
    reference: 'https://spdx.org/licenses/pnmstitch.html'
  },
  'PolyForm-Noncommercial-1.0.0': {
    isOpenSource: false,
    name: 'PolyForm Noncommercial License 1.0.0',
    reference: 'https://spdx.org/licenses/PolyForm-Noncommercial-1.0.0.html'
  },
  'PolyForm-Small-Business-1.0.0': {
    isOpenSource: false,
    name: 'PolyForm Small Business License 1.0.0',
    reference: 'https://spdx.org/licenses/PolyForm-Small-Business-1.0.0.html'
  },
  PostgreSQL: {
    isOpenSource: true,
    name: 'PostgreSQL License',
    reference: 'https://spdx.org/licenses/PostgreSQL.html'
  },
  'PSF-2.0': {
    isOpenSource: false,
    name: 'Python Software Foundation License 2.0',
    reference: 'https://spdx.org/licenses/PSF-2.0.html'
  },
  psfrag: {
    isOpenSource: false,
    name: 'psfrag License',
    reference: 'https://spdx.org/licenses/psfrag.html'
  },
  psutils: {
    isOpenSource: false,
    name: 'psutils License',
    reference: 'https://spdx.org/licenses/psutils.html'
  },
  'Python-2.0': {
    isOpenSource: true,
    name: 'Python License 2.0',
    reference: 'https://spdx.org/licenses/Python-2.0.html'
  },
  'Python-2.0.1': {
    isOpenSource: false,
    name: 'Python License 2.0.1',
    reference: 'https://spdx.org/licenses/Python-2.0.1.html'
  },
  'python-ldap': {
    isOpenSource: false,
    name: 'Python ldap License',
    reference: 'https://spdx.org/licenses/python-ldap.html'
  },
  Qhull: {
    isOpenSource: false,
    name: 'Qhull License',
    reference: 'https://spdx.org/licenses/Qhull.html'
  },
  'QPL-1.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Q Public License 1.0',
    reference: 'https://spdx.org/licenses/QPL-1.0.html'
  },
  'QPL-1.0-INRIA-2004': {
    isOpenSource: false,
    name: 'Q Public License 1.0 - INRIA 2004 variant',
    reference: 'https://spdx.org/licenses/QPL-1.0-INRIA-2004.html'
  },
  radvd: {
    isOpenSource: false,
    name: 'radvd License',
    reference: 'https://spdx.org/licenses/radvd.html'
  },
  Rdisc: {
    isOpenSource: false,
    name: 'Rdisc License',
    reference: 'https://spdx.org/licenses/Rdisc.html'
  },
  'RHeCos-1.1': {
    isOpenSource: false,
    name: 'Red Hat eCos Public License v1.1',
    reference: 'https://spdx.org/licenses/RHeCos-1.1.html'
  },
  'RPL-1.1': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Reciprocal Public License 1.1',
    reference: 'https://spdx.org/licenses/RPL-1.1.html'
  },
  'RPL-1.5': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Reciprocal Public License 1.5',
    reference: 'https://spdx.org/licenses/RPL-1.5.html'
  },
  'RPSL-1.0': {
    isOpenSource: true,
    name: 'RealNetworks Public Source License v1.0',
    reference: 'https://spdx.org/licenses/RPSL-1.0.html'
  },
  'RSA-MD': {
    isOpenSource: false,
    name: 'RSA Message-Digest License',
    reference: 'https://spdx.org/licenses/RSA-MD.html'
  },
  RSCPL: {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Ricoh Source Code Public License',
    reference: 'https://spdx.org/licenses/RSCPL.html'
  },
  Ruby: {
    isOpenSource: true,
    name: 'Ruby License',
    reference: 'https://spdx.org/licenses/Ruby.html'
  },
  'SAX-PD': {
    isOpenSource: false,
    name: 'Sax Public Domain Notice',
    reference: 'https://spdx.org/licenses/SAX-PD.html'
  },
  'SAX-PD-2.0': {
    isOpenSource: false,
    name: 'Sax Public Domain Notice 2.0',
    reference: 'https://spdx.org/licenses/SAX-PD-2.0.html'
  },
  Saxpath: {
    isOpenSource: false,
    name: 'Saxpath License',
    reference: 'https://spdx.org/licenses/Saxpath.html'
  },
  SCEA: {
    isOpenSource: false,
    name: 'SCEA Shared Source License',
    reference: 'https://spdx.org/licenses/SCEA.html'
  },
  SchemeReport: {
    isOpenSource: false,
    name: 'Scheme Language Report License',
    reference: 'https://spdx.org/licenses/SchemeReport.html'
  },
  Sendmail: {
    isOpenSource: false,
    name: 'Sendmail License',
    reference: 'https://spdx.org/licenses/Sendmail.html'
  },
  'Sendmail-8.23': {
    isOpenSource: false,
    name: 'Sendmail License 8.23',
    reference: 'https://spdx.org/licenses/Sendmail-8.23.html'
  },
  'SGI-B-1.0': {
    isOpenSource: false,
    name: 'SGI Free Software License B v1.0',
    reference: 'https://spdx.org/licenses/SGI-B-1.0.html'
  },
  'SGI-B-1.1': {
    isOpenSource: false,
    name: 'SGI Free Software License B v1.1',
    reference: 'https://spdx.org/licenses/SGI-B-1.1.html'
  },
  'SGI-B-2.0': {
    isOpenSource: true,
    name: 'SGI Free Software License B v2.0',
    reference: 'https://spdx.org/licenses/SGI-B-2.0.html'
  },
  'SGI-OpenGL': {
    isOpenSource: false,
    name: 'SGI OpenGL License',
    reference: 'https://spdx.org/licenses/SGI-OpenGL.html'
  },
  SGP4: {
    isOpenSource: false,
    name: 'SGP4 Permission Notice',
    reference: 'https://spdx.org/licenses/SGP4.html'
  },
  'SHL-0.5': {
    isOpenSource: false,
    name: 'Solderpad Hardware License v0.5',
    reference: 'https://spdx.org/licenses/SHL-0.5.html'
  },
  'SHL-0.51': {
    isOpenSource: false,
    name: 'Solderpad Hardware License, Version 0.51',
    reference: 'https://spdx.org/licenses/SHL-0.51.html'
  },
  'SimPL-2.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Simple Public License 2.0',
    reference: 'https://spdx.org/licenses/SimPL-2.0.html'
  },
  SISSL: {
    isOpenSource: true,
    name: 'Sun Industry Standards Source License v1.1',
    reference: 'https://spdx.org/licenses/SISSL.html'
  },
  'SISSL-1.2': {
    isOpenSource: false,
    name: 'Sun Industry Standards Source License v1.2',
    reference: 'https://spdx.org/licenses/SISSL-1.2.html'
  },
  SL: {
    isOpenSource: false,
    name: 'SL License',
    reference: 'https://spdx.org/licenses/SL.html'
  },
  Sleepycat: {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Sleepycat License',
    reference: 'https://spdx.org/licenses/Sleepycat.html'
  },
  SMLNJ: {
    isOpenSource: true,
    name: 'Standard ML of New Jersey License',
    reference: 'https://spdx.org/licenses/SMLNJ.html'
  },
  SMPPL: {
    isOpenSource: false,
    name: 'Secure Messaging Protocol Public License',
    reference: 'https://spdx.org/licenses/SMPPL.html'
  },
  SNIA: {
    isOpenSource: false,
    name: 'SNIA Public License 1.1',
    reference: 'https://spdx.org/licenses/SNIA.html'
  },
  snprintf: {
    isOpenSource: false,
    name: 'snprintf License',
    reference: 'https://spdx.org/licenses/snprintf.html'
  },
  Soundex: {
    isOpenSource: false,
    name: 'Soundex License',
    reference: 'https://spdx.org/licenses/Soundex.html'
  },
  'Spencer-86': {
    isOpenSource: false,
    name: 'Spencer License 86',
    reference: 'https://spdx.org/licenses/Spencer-86.html'
  },
  'Spencer-94': {
    isOpenSource: false,
    name: 'Spencer License 94',
    reference: 'https://spdx.org/licenses/Spencer-94.html'
  },
  'Spencer-99': {
    isOpenSource: false,
    name: 'Spencer License 99',
    reference: 'https://spdx.org/licenses/Spencer-99.html'
  },
  'SPL-1.0': {
    isCopyleft: true,
    isOpenSource: true,
    name: 'Sun Public License v1.0',
    reference: 'https://spdx.org/licenses/SPL-1.0.html'
  },
  'ssh-keyscan': {
    isOpenSource: false,
    name: 'ssh-keyscan License',
    reference: 'https://spdx.org/licenses/ssh-keyscan.html'
  },
  'SSH-OpenSSH': {
    isOpenSource: false,
    name: 'SSH OpenSSH license',
    reference: 'https://spdx.org/licenses/SSH-OpenSSH.html'
  },
  'SSH-short': {
    isOpenSource: false,
    name: 'SSH short notice',
    reference: 'https://spdx.org/licenses/SSH-short.html'
  },
  'SSPL-1.0': {
    isOpenSource: false,
    name: 'Server Side Public License, v 1',
    reference: 'https://spdx.org/licenses/SSPL-1.0.html'
  },
  'StandardML-NJ': {
    isOpenSource: true,
    name: 'Standard ML of New Jersey License',
    reference: 'https://spdx.org/licenses/StandardML-NJ.html'
  },
  'SugarCRM-1.1.3': {
    isOpenSource: false,
    name: 'SugarCRM Public License v1.1.3',
    reference: 'https://spdx.org/licenses/SugarCRM-1.1.3.html'
  },
  SunPro: {
    isOpenSource: false,
    name: 'SunPro License',
    reference: 'https://spdx.org/licenses/SunPro.html'
  },
  SWL: {
    isOpenSource: false,
    name: 'Scheme Widget Library (SWL) Software License Agreement',
    reference: 'https://spdx.org/licenses/SWL.html'
  },
  swrule: {
    isOpenSource: false,
    name: 'swrule License',
    reference: 'https://spdx.org/licenses/swrule.html'
  },
  Symlinks: {
    isOpenSource: false,
    name: 'Symlinks License',
    reference: 'https://spdx.org/licenses/Symlinks.html'
  },
  'TAPR-OHL-1.0': {
    isOpenSource: false,
    name: 'TAPR Open Hardware License v1.0',
    reference: 'https://spdx.org/licenses/TAPR-OHL-1.0.html'
  },
  TCL: {
    isOpenSource: false,
    name: 'TCL/TK License',
    reference: 'https://spdx.org/licenses/TCL.html'
  },
  'TCP-wrappers': {
    isOpenSource: false,
    name: 'TCP Wrappers License',
    reference: 'https://spdx.org/licenses/TCP-wrappers.html'
  },
  TermReadKey: {
    isOpenSource: false,
    name: 'TermReadKey License',
    reference: 'https://spdx.org/licenses/TermReadKey.html'
  },
  'TGPPL-1.0': {
    isOpenSource: false,
    name: 'Transitive Grace Period Public Licence 1.0',
    reference: 'https://spdx.org/licenses/TGPPL-1.0.html'
  },
  TMate: {
    isOpenSource: false,
    name: 'TMate Open Source License',
    reference: 'https://spdx.org/licenses/TMate.html'
  },
  'TORQUE-1.1': {
    isOpenSource: false,
    name: 'TORQUE v2.5+ Software License v1.1',
    reference: 'https://spdx.org/licenses/TORQUE-1.1.html'
  },
  TOSL: {
    isOpenSource: false,
    name: 'Trusster Open Source License',
    reference: 'https://spdx.org/licenses/TOSL.html'
  },
  TPDL: {
    isOpenSource: false,
    name: 'Time::ParseDate License',
    reference: 'https://spdx.org/licenses/TPDL.html'
  },
  'TPL-1.0': {
    isOpenSource: false,
    name: 'THOR Public License 1.0',
    reference: 'https://spdx.org/licenses/TPL-1.0.html'
  },
  TTWL: {
    isOpenSource: false,
    name: 'Text-Tabs+Wrap License',
    reference: 'https://spdx.org/licenses/TTWL.html'
  },
  TTYP0: {
    isOpenSource: false,
    name: 'TTYP0 License',
    reference: 'https://spdx.org/licenses/TTYP0.html'
  },
  'TU-Berlin-1.0': {
    isOpenSource: false,
    name: 'Technische Universitaet Berlin License 1.0',
    reference: 'https://spdx.org/licenses/TU-Berlin-1.0.html'
  },
  'TU-Berlin-2.0': {
    isOpenSource: false,
    name: 'Technische Universitaet Berlin License 2.0',
    reference: 'https://spdx.org/licenses/TU-Berlin-2.0.html'
  },
  UCAR: {
    isOpenSource: false,
    name: 'UCAR License',
    reference: 'https://spdx.org/licenses/UCAR.html'
  },
  'UCL-1.0': {
    isOpenSource: true,
    name: 'Upstream Compatibility License v1.0',
    reference: 'https://spdx.org/licenses/UCL-1.0.html'
  },
  ulem: {
    isOpenSource: false,
    name: 'ulem License',
    reference: 'https://spdx.org/licenses/ulem.html'
  },
  'Unicode-3.0': {
    isOpenSource: true,
    name: 'Unicode License v3',
    reference: 'https://spdx.org/licenses/Unicode-3.0.html'
  },
  'Unicode-DFS-2015': {
    isOpenSource: false,
    name: 'Unicode License Agreement - Data Files and Software (2015)',
    reference: 'https://spdx.org/licenses/Unicode-DFS-2015.html'
  },
  'Unicode-DFS-2016': {
    isOpenSource: true,
    name: 'Unicode License Agreement - Data Files and Software (2016)',
    reference: 'https://spdx.org/licenses/Unicode-DFS-2016.html'
  },
  'Unicode-TOU': {
    isOpenSource: false,
    name: 'Unicode Terms of Use',
    reference: 'https://spdx.org/licenses/Unicode-TOU.html'
  },
  UnixCrypt: {
    isOpenSource: false,
    name: 'UnixCrypt License',
    reference: 'https://spdx.org/licenses/UnixCrypt.html'
  },
  Unlicense: {
    isOpenSource: true,
    name: 'The Unlicense',
    reference: 'https://spdx.org/licenses/Unlicense.html'
  },
  'UPL-1.0': {
    isOpenSource: true,
    name: 'Universal Permissive License v1.0',
    reference: 'https://spdx.org/licenses/UPL-1.0.html'
  },
  'URT-RLE': {
    isOpenSource: false,
    name: 'Utah Raster Toolkit Run Length Encoded License',
    reference: 'https://spdx.org/licenses/URT-RLE.html'
  },
  Vim: {
    isOpenSource: true,
    name: 'Vim License',
    reference: 'https://spdx.org/licenses/Vim.html'
  },
  VOSTROM: {
    isOpenSource: false,
    name: 'VOSTROM Public License for Open Source',
    reference: 'https://spdx.org/licenses/VOSTROM.html'
  },
  'VSL-1.0': {
    isOpenSource: true,
    name: 'Vovida Software License v1.0',
    reference: 'https://spdx.org/licenses/VSL-1.0.html'
  },
  W3C: {
    isOpenSource: true,
    name: 'W3C Software Notice and License (2002-12-31)',
    reference: 'https://spdx.org/licenses/W3C.html'
  },
  'W3C-19980720': {
    isOpenSource: false,
    name: 'W3C Software Notice and License (1998-07-20)',
    reference: 'https://spdx.org/licenses/W3C-19980720.html'
  },
  'W3C-20150513': {
    isOpenSource: false,
    name: 'W3C Software Notice and Document License (2015-05-13)',
    reference: 'https://spdx.org/licenses/W3C-20150513.html'
  },
  w3m: {
    isOpenSource: false,
    name: 'w3m License',
    reference: 'https://spdx.org/licenses/w3m.html'
  },
  'Watcom-1.0': {
    isOpenSource: true,
    name: 'Sybase Open Watcom Public License 1.0',
    reference: 'https://spdx.org/licenses/Watcom-1.0.html'
  },
  'Widget-Workshop': {
    isOpenSource: false,
    name: 'Widget Workshop License',
    reference: 'https://spdx.org/licenses/Widget-Workshop.html'
  },
  Wsuipa: {
    isOpenSource: false,
    name: 'Wsuipa License',
    reference: 'https://spdx.org/licenses/Wsuipa.html'
  },
  WTFPL: {
    isOpenSource: true,
    name: 'Do What The F*ck You Want To Public License',
    reference: 'https://spdx.org/licenses/WTFPL.html'
  },
  wxWindows: {
    isOpenSource: true,
    name: 'wxWindows Library License',
    reference: 'https://spdx.org/licenses/wxWindows.html'
  },
  X11: {
    isOpenSource: true,
    name: 'X11 License',
    reference: 'https://spdx.org/licenses/X11.html'
  },
  'X11-distribute-modifications-variant': {
    isOpenSource: false,
    name: 'X11 License Distribution Modification Variant',
    reference: 'https://spdx.org/licenses/X11-distribute-modifications-variant.html'
  },
  'Xdebug-1.03': {
    isOpenSource: false,
    name: 'Xdebug License v 1.03',
    reference: 'https://spdx.org/licenses/Xdebug-1.03.html'
  },
  Xerox: {
    isOpenSource: false,
    name: 'Xerox License',
    reference: 'https://spdx.org/licenses/Xerox.html'
  },
  Xfig: {
    isOpenSource: false,
    name: 'Xfig License',
    reference: 'https://spdx.org/licenses/Xfig.html'
  },
  'XFree86-1.1': {
    isOpenSource: true,
    name: 'XFree86 License 1.1',
    reference: 'https://spdx.org/licenses/XFree86-1.1.html'
  },
  xinetd: {
    isOpenSource: true,
    name: 'xinetd License',
    reference: 'https://spdx.org/licenses/xinetd.html'
  },
  'xkeyboard-config-Zinoviev': {
    isOpenSource: false,
    name: 'xkeyboard-config Zinoviev License',
    reference: 'https://spdx.org/licenses/xkeyboard-config-Zinoviev.html'
  },
  xlock: {
    isOpenSource: false,
    name: 'xlock License',
    reference: 'https://spdx.org/licenses/xlock.html'
  },
  Xnet: {
    isOpenSource: true,
    name: 'X.Net License',
    reference: 'https://spdx.org/licenses/Xnet.html'
  },
  xpp: {
    isOpenSource: false,
    name: 'XPP License',
    reference: 'https://spdx.org/licenses/xpp.html'
  },
  XSkat: {
    isOpenSource: false,
    name: 'XSkat License',
    reference: 'https://spdx.org/licenses/XSkat.html'
  },
  'YPL-1.0': {
    isOpenSource: false,
    name: 'Yahoo! Public License v1.0',
    reference: 'https://spdx.org/licenses/YPL-1.0.html'
  },
  'YPL-1.1': {
    isOpenSource: true,
    name: 'Yahoo! Public License v1.1',
    reference: 'https://spdx.org/licenses/YPL-1.1.html'
  },
  Zed: {
    isOpenSource: false,
    name: 'Zed License',
    reference: 'https://spdx.org/licenses/Zed.html'
  },
  Zeeff: {
    isOpenSource: false,
    name: 'Zeeff License',
    reference: 'https://spdx.org/licenses/Zeeff.html'
  },
  'Zend-2.0': {
    isOpenSource: true,
    name: 'Zend License v2.0',
    reference: 'https://spdx.org/licenses/Zend-2.0.html'
  },
  'Zimbra-1.3': {
    isOpenSource: true,
    name: 'Zimbra Public License v1.3',
    reference: 'https://spdx.org/licenses/Zimbra-1.3.html'
  },
  'Zimbra-1.4': {
    isOpenSource: false,
    name: 'Zimbra Public License v1.4',
    reference: 'https://spdx.org/licenses/Zimbra-1.4.html'
  },
  Zlib: {
    isOpenSource: true,
    name: 'zlib License',
    reference: 'https://spdx.org/licenses/Zlib.html'
  },
  'zlib-acknowledgement': {
    isOpenSource: false,
    name: 'zlib/libpng License with Acknowledgement',
    reference: 'https://spdx.org/licenses/zlib-acknowledgement.html'
  },
  'ZPL-1.1': {
    isOpenSource: false,
    name: 'Zope Public License 1.1',
    reference: 'https://spdx.org/licenses/ZPL-1.1.html'
  },
  'ZPL-2.0': {
    isOpenSource: true,
    name: 'Zope Public License 2.0',
    reference: 'https://spdx.org/licenses/ZPL-2.0.html'
  },
  'ZPL-2.1': {
    isOpenSource: true,
    name: 'Zope Public License 2.1',
    reference: 'https://spdx.org/licenses/ZPL-2.1.html'
  }
};

export const licenses = new Map(Object.entries({ ...customLicenses, ...spdxLicenses }));
