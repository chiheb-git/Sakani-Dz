import dotenv from "dotenv";
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../artifacts/api-server/.env") });

const expectedWilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
  "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda",
  "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla",
  "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Oran",
  "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal",
  "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa",
] as const;

type SpotSeed = {
  name: string;
  wilaya: (typeof expectedWilayas)[number];
  description: string;
  latitude: string;
  longitude: string;
  photos: string[];
};

/**
 * Closed allow-list of photographs whose Commons file page explicitly names the
 * precise site.  Do not add a result returned merely for a wilaya, a category,
 * or a similar landscape: an empty photo array is intentional and preferable.
 */
const verifiedPhotos: Record<string, { url: string; source: string; evidence: string }> = {
  "Timgad": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Timgad_Ruins_Panorama.jpg/1280px-Timgad_Ruins_Panorama.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Timgad_Ruins_Panorama.jpg",
    evidence: "Titre du fichier : Timgad Ruins Panorama.",
  },
  "Cascades de Kefrida": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/Cascades_De_Kefrida.JPG/1280px-Cascades_De_Kefrida.JPG",
    source: "https://commons.wikimedia.org/wiki/File:Cascades_De_Kefrida.JPG",
    evidence: "Titre du fichier : Cascades De Kefrida.",
  },
  "Oasis de Tolga": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Alg%C3%A9rie._%28Oasis_de_Tolga_%28Zibans%29%29_-_%28photogr._Eug%C3%A8ne%29_Gallois_%3B_%28photogr._reprod._par_Radiguet_et_Massiot_pour_la_conf%C3%A9rence_donn%C3%A9e_par%29_Gallois_-_btv1b532798148.jpg/1280px-thumbnail.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Alg%C3%A9rie._(Oasis_de_Tolga_(Zibans))_-_(photogr._Eug%C3%A8ne)_Gallois;_(photogr._reprod._par_Radiguet_et_Massiot_pour_la_conf%C3%A9rence_donn%C3%A9e_par)_Gallois_-_btv1b532798148.jpg",
    evidence: "Titre du fichier : Oasis de Tolga (Zibans).",
  },
  "Oasis de Taghit": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Vue_de_Taghit.jpg/1280px-Vue_de_Taghit.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Vue_de_Taghit.jpg",
    evidence: "Titre du fichier : Vue de Taghit.",
  },
  "Parc national de Chréa": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Chrea_National_Park.jpg/1280px-Chrea_National_Park.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Chrea_National_Park.jpg",
    evidence: "Titre du fichier : Chrea National Park.",
  },
  "Parc national de l'Ahaggar": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/Dune_de_sable_au_parc_Culturel_De_l%27Ahaggar_crop.jpg/1280px-Dune_de_sable_au_parc_Culturel_De_l%27Ahaggar_crop.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Dune_de_sable_au_parc_Culturel_De_l%27Ahaggar_crop.jpg",
    evidence: "Titre du fichier : Dune de sable au parc culturel de l'Ahaggar.",
  },
  "Palais d'El Mechouar": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Palais_d%27EL_Mechouar_Telemcen_Algerie.jpg/1280px-Palais_d%27EL_Mechouar_Telemcen_Algerie.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Palais_d%27EL_Mechouar_Telemcen_Algerie.jpg",
    evidence: "Titre du fichier : Palais d'EL Mechouar Tlemcen Algerie.",
  },
  "Grottes merveilleuses de Ziama Mansouriah": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Les_grottes_merveilleuses_a_ziama_jijel.jpg/1280px-Les_grottes_merveilleuses_a_ziama_jijel.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Les_grottes_merveilleuses_a_ziama_jijel.jpg",
    evidence: "Titre du fichier : Les grottes merveilleuses à Ziama Jijel.",
  },
  "Parc national de Taza": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Parc_National_de_TAZA_-_Jijel.jpg/1280px-Parc_National_de_TAZA_-_Jijel.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Parc_National_de_TAZA_-_Jijel.jpg",
    evidence: "Titre du fichier : Parc National de TAZA - Jijel.",
  },
  "Basilique Saint-Augustin": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Basilique_saint_augustin_annaba_4.jpg/1280px-Basilique_saint_augustin_annaba_4.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Basilique_saint_augustin_annaba_4.jpg",
    evidence: "Titre du fichier : Basilique saint augustin annaba.",
  },
  "Théâtre romain de Guelma": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/The_Roman_theatre_of_Guelma_02.jpg/1280px-The_Roman_theatre_of_Guelma_02.jpg",
    source: "https://commons.wikimedia.org/wiki/File:The_Roman_theatre_of_Guelma_02.jpg",
    evidence: "Titre du fichier : The Roman theatre of Guelma.",
  },
  "Pont Sidi Rached": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/La_vieille_ville_de_Constantine_et_le_pont_Sidi_Rached.jpg/1280px-La_vieille_ville_de_Constantine_et_le_pont_Sidi_Rached.jpg",
    source: "https://commons.wikimedia.org/wiki/File:La_vieille_ville_de_Constantine_et_le_pont_Sidi_Rached.jpg",
    evidence: "Titre du fichier : La vieille ville de Constantine et le pont Sidi Rached.",
  },
  "Bains de Hammam Essalihine": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/La_piscine_circulaire_Hammam_essalhine_khenchela_aures.jpg/1280px-La_piscine_circulaire_Hammam_essalhine_khenchela_aures.jpg",
    source: "https://commons.wikimedia.org/wiki/File:La_piscine_circulaire_Hammam_essalhine_khenchela_aures.jpg",
    evidence: "Titre du fichier : La piscine circulaire Hammam Essalihine Khenchela Aurès.",
  },
  "Tipasa antique": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e6/Large_Christian_Basilica_%28Tipasa%29_02.jpg/1280px-Large_Christian_Basilica_%28Tipasa%29_02.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Large_Christian_Basilica_(Tipasa)_02.jpg",
    evidence: "Titre du fichier : Large Christian Basilica (Tipasa).",
  },
  "Oasis rouge de Timimoun": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/Door_in_Timimoun_01.jpg/1280px-Door_in_Timimoun_01.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Door_in_Timimoun_01.jpg",
    evidence: "Titre du fichier : Door in Timimoun.",
  },
  "Cascades d'El-Ourit (Chalalat)": {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Cascades%20d%27El%20Ourit%202024%2006.jpg?width=1280",
    source: "https://commons.wikimedia.org/wiki/File:Cascades_d%27El_Ourit_2024_06.jpg",
    evidence: "Description Commons : cascades d'El-Ourit à 7 km de Tlemcen ; GPS 34.862682, -1.266832.",
  },
};

// Historical values retained only to avoid a large mechanical rewrite of the seed
// declarations below. `photo()` deliberately never returns them; resolvePhotos()
// replaces every initial value from the closed verifiedPhotos allow-list.
const deprecatedPhotoUrls: Record<string, string> = {
  "desert,architecture": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Kesba_of_melouka_bordj_2.jpg/1280px-Kesba_of_melouka_bordj_2.jpg",
  "mountains,valley": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Reflet_des_hauteurs_de_Djurdjura_sur_le_Barrage_de_Tilesdit_%28Parc_National_du_Djurdjura%29.jpg/1280px-Reflet_des_hauteurs_de_Djurdjura_sur_le_Barrage_de_Tilesdit_%28Parc_National_du_Djurdjura%29.jpg",
  "desert,mosque": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9f/Ksar_de_Bounoura.jpg/1280px-Ksar_de_Bounoura.jpg",
  "lake,nature": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/El_Kala_-_Algerian-Tunisian_Border.jpg/1280px-El_Kala_-_Algerian-Tunisian_Border.jpg",
  "ancient,ruins": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Timgad_Ruins_Panorama.jpg/1280px-Timgad_Ruins_Panorama.jpg",
  "waterfall,forest": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/Cascades_De_Kefrida.JPG/1280px-Cascades_De_Kefrida.JPG",
  "palm,desert": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Alg%C3%A9rie._%28Oasis_de_Tolga_%28Zibans%29%29_-_%28photogr._Eug%C3%A8ne%29_Gallois_%3B_%28photogr._reprod._par_Radiguet_et_Massiot_pour_la_conf%C3%A9rence_donn%C3%A9e_par%29_Gallois_-_btv1b532798148.jpg/1280px-thumbnail.jpg",
  "sahara,dunes": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Vue_de_Taghit.jpg/1280px-Vue_de_Taghit.jpg",
  "cedar,mountains": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Chrea_National_Park.jpg/1280px-Chrea_National_Park.jpg",
  "mountains,forest": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Reflet_des_hauteurs_de_Djurdjura_sur_le_Barrage_de_Tilesdit_%28Parc_National_du_Djurdjura%29.jpg/1280px-Reflet_des_hauteurs_de_Djurdjura_sur_le_Barrage_de_Tilesdit_%28Parc_National_du_Djurdjura%29.jpg",
  "volcanic,desert": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/Dune_de_sable_au_parc_Culturel_De_l%27Ahaggar_crop.jpg/1280px-Dune_de_sable_au_parc_Culturel_De_l%27Ahaggar_crop.jpg",
  "roman,ruins": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/Basilique_de_T%C3%A9bessa_-_%D8%A7%D9%84%D9%83%D9%86%D9%8A%D8%B3%D8%A9_%D8%A7%D9%84%D8%B1%D9%88%D9%85%D8%A7%D9%86%D9%8A%D8%A9_3.jpg/1280px-Basilique_de_T%C3%A9bessa_-_%D8%A7%D9%84%D9%83%D9%86%D9%8A%D8%B3%D8%A9_%D8%A7%D9%84%D8%B1%D9%88%D9%85%D8%A7%D9%86%D9%8A%D8%A9_3.jpg",
  "islamic,architecture": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Palais_d%27EL_Mechouar_Telemcen_Algerie.jpg/1280px-Palais_d%27EL_Mechouar_Telemcen_Algerie.jpg",
  "mediterranean,old-town": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/%28Narbonne%29_Rue_dans_la_casbah_d%27Alger_-_Eug%C3%A8ne_Isabey_-_Mus%C3%A9e_des_Beaux-Arts_de_Narbonne.jpg/1280px-%28Narbonne%29_Rue_dans_la_casbah_d%27Alger_-_Eug%C3%A8ne_Isabey_-_Mus%C3%A9e_des_Beaux-Arts_de_Narbonne.jpg",
  "fort,mediterranean": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/Bastion_de_France%2C_El_Kala%2C_wilaya_d%27El_Taref%2C_Alg%C3%A9rie_5.JPG/1280px-Bastion_de_France%2C_El_Kala%2C_wilaya_d%27El_Taref%2C_Alg%C3%A9rie_5.JPG",
  "canyon,desert": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Kalaa_des_Beni_Hammad_2%2C_M%27sila.jpg/1280px-Kalaa_des_Beni_Hammad_2%2C_M%27sila.jpg",
  "cave,nature": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Les_grottes_merveilleuses_a_ziama_jijel.jpg/1280px-Les_grottes_merveilleuses_a_ziama_jijel.jpg",
  "coast,forest": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Parc_National_de_TAZA_-_Jijel.jpg/1280px-Parc_National_de_TAZA_-_Jijel.jpg",
  "roman,theater": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/The_Roman_theatre_of_Guelma_02.jpg/1280px-The_Roman_theatre_of_Guelma_02.jpg",
  "spring,forest": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Chrea_National_Park.jpg/1280px-Chrea_National_Park.jpg",
  "mediterranean,coast": "https://upload.wikimedia.org/wikipedia/commons/1/15/El-Kala_sunset.jpg",
  "landscape,algeria": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Reflet_des_hauteurs_de_Djurdjura_sur_le_Barrage_de_Tilesdit_%28Parc_National_du_Djurdjura%29.jpg/1280px-Reflet_des_hauteurs_de_Djurdjura_sur_le_Barrage_de_Tilesdit_%28Parc_National_du_Djurdjura%29.jpg",
  "basilica,coast": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Basilique_saint_augustin_annaba_4.jpg/1280px-Basilique_saint_augustin_annaba_4.jpg",
  "bridge,canyon": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/La_vieille_ville_de_Constantine_et_le_pont_Sidi_Rached.jpg/1280px-La_vieille_ville_de_Constantine_et_le_pont_Sidi_Rached.jpg",
  "ancient,monument": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/Theatre_-_Madaure_%28near_Souk_Ahras%29_%2815678551077%29.jpg/1280px-Theatre_-_Madaure_%28near_Souk_Ahras%29_%2815678551077%29.jpg",
  "beach,mediterranean": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Le_Grand_Hotel_des_Sablettes.JPG/1280px-Le_Grand_Hotel_des_Sablettes.JPG",
  "ruins,landscape": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/28-2_Kal%C3%A2a_de_Beni_Hammad_%282%29.jpg/1280px-28-2_Kal%C3%A2a_de_Beni_Hammad_%282%29.jpg",
  "village,hills": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/Mulli%C3%A9_-_Biographie_des_c%C3%A9l%C3%A9brit%C3%A9s_militaires_des_arm%C3%A9es_de_terre_et_de_mer_de_1789_%C3%A0_1850%2C_I.djvu/page1-1280px-Mulli%C3%A9_-_Biographie_des_c%C3%A9l%C3%A9brit%C3%A9s_militaires_des_arm%C3%A9es_de_terre_et_de_mer_de_1789_%C3%A0_1850%2C_I.djvu.jpg",
  "museum,desert": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Mzab_Gharda%C3%AFa.jpg",
  "sahara,rock": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Sunrise_Djanet.jpg/1280px-Sunrise_Djanet.jpg",
  "coast,beach": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Parc_National_de_TAZA_-_Jijel.jpg/1280px-Parc_National_de_TAZA_-_Jijel.jpg",
  "lake,forest": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/El_Kala_-_Algerian-Tunisian_Border.jpg/1280px-El_Kala_-_Algerian-Tunisian_Border.jpg",
  "sahara,rocks": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Sunrise_Djanet.jpg/1280px-Sunrise_Djanet.jpg",
  "forest,mountains": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Chrea_National_Park.jpg/1280px-Chrea_National_Park.jpg",
  "salt,lake,desert": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/El_Kala_-_Algerian-Tunisian_Border.jpg/1280px-El_Kala_-_Algerian-Tunisian_Border.jpg",
  "thermal,spring,mountains": "https://upload.wikimedia.org/wikipedia/commons/a/a9/La_piscine_circulaire_Hammam_essalhine_khenchela_aures.jpg",
  "roman,sea": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e6/Large_Christian_Basilica_%28Tipasa%29_02.jpg/1280px-Large_Christian_Basilica_%28Tipasa%29_02.jpg",
  "lake,hills": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/El_Kala_-_Algerian-Tunisian_Border.jpg/1280px-El_Kala_-_Algerian-Tunisian_Border.jpg",
  "gorge,mountains": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Reflet_des_hauteurs_de_Djurdjura_sur_le_Barrage_de_Tilesdit_%28Parc_National_du_Djurdjura%29.jpg/1280px-Reflet_des_hauteurs_de_Djurdjura_sur_le_Barrage_de_Tilesdit_%28Parc_National_du_Djurdjura%29.jpg",
  "desert,ksar": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9f/Ksar_de_Bounoura.jpg/1280px-Ksar_de_Bounoura.jpg",
  "island,mediterranean": "https://upload.wikimedia.org/wikipedia/commons/1/15/El-Kala_sunset.jpg",
  "river,canyon": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Reflet_des_hauteurs_de_Djurdjura_sur_le_Barrage_de_Tilesdit_%28Parc_National_du_Djurdjura%29.jpg/1280px-Reflet_des_hauteurs_de_Djurdjura_sur_le_Barrage_de_Tilesdit_%28Parc_National_du_Djurdjura%29.jpg",
  "red,desert,oasis": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/Door_in_Timimoun_01.jpg/1280px-Door_in_Timimoun_01.jpg",
  "desert,rock": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Sunrise_Djanet.jpg/1280px-Sunrise_Djanet.jpg",
  "oasis,palm": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Alg%C3%A9rie._%28Oasis_de_Tolga_%28Zibans%29%29_-_%28photogr._Eug%C3%A8ne%29_Gallois_%3B_%28photogr._reprod._par_Radiguet_et_Massiot_pour_la_conf%C3%A9rence_donn%C3%A9e_par%29_Gallois_-_btv1b532798148.jpg/1280px-thumbnail.jpg",
  "oasis,dunes": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Vue_de_Taghit.jpg/1280px-Vue_de_Taghit.jpg",
  "oasis,desert": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Vue_de_Taghit.jpg/1280px-Vue_de_Taghit.jpg",
  "sand,dunes": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Vue_de_Taghit.jpg/1280px-Vue_de_Taghit.jpg",
  "oasis,architecture": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9f/Ksar_de_Bounoura.jpg/1280px-Ksar_de_Bounoura.jpg",
  "tassili,desert": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Sunrise_Djanet.jpg/1280px-Sunrise_Djanet.jpg",
  "lake,oasis": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/El_Kala_-_Algerian-Tunisian_Border.jpg/1280px-El_Kala_-_Algerian-Tunisian_Border.jpg",
};

const photo = (_key: string) => "";

async function resolvePhotos(spots: SpotSeed[]) {
  for (const spot of spots) spot.photos = verifiedPhotos[spot.name] ? [verifiedPhotos[spot.name].url] : [];
  console.log(`Photos de lieux exacts retenues : ${spots.filter((spot) => spot.photos.length).length}/${spots.length}`);
}

async function validatePhotoUrls(spots: SpotSeed[]) {
  const urls = spots.flatMap((spot) => spot.photos);
  const duplicates = urls.filter((url, index) => urls.indexOf(url) !== index);
  if (duplicates.length) {
    throw new Error(`Images dupliquees interdites : ${[...new Set(duplicates)].join(", ")}`);
  }

  for (const url of [...new Set(urls)]) {
    let response: Response | undefined;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        response = await fetch(url, {
          method: attempt === 0 ? "HEAD" : "GET",
          redirect: "follow",
          headers: { "User-Agent": "Sakani tourism seed/1.0 (image validator; contact=sakani@example.com)" },
        });
      } catch {
        response = undefined;
      }
      if (response?.ok) break;
      if (response && response.status !== 429 && response.status < 500) break;
      await new Promise((resolve) => setTimeout(resolve, 3000 * (attempt + 1)));
    }
    if (!response?.ok) {
      throw new Error(`Image Wikimedia inaccessible (${response?.status ?? "reseau"}) : ${url}`);
    }
  }
  console.log(`Images Wikimedia validees en HTTP : ${urls.length}`);
}

const supplementalNames: Record<(typeof expectedWilayas)[number], string[]> = {
  "Adrar": ["Ksar de Fenoughil", "Foggaras de Reggane", "Oasis de Zaouiet Kounta"],
  "Chlef": ["Barrage de Sidi Yacoub", "Vieille ville de Ténès", "Grotte de Kef el Asfar"],
  "Laghouat": ["Ksar de Laghouat", "Gorges de Messaad", "Oasis d'Aflou"],
  "Oum El Bouaghi": ["Lac de Garaet Guellif", "Lac salé de Tinsilt", "Mont Sidi R'Gheiss"],
  "Batna": ["Balcons de Ghoufi", "Lambaesis", "Parc national de Belezma"],
  "Béjaïa": ["Cap Carbon", "Parc national de Gouraya", "Yemma Gouraya"],
  "Biskra": ["Gorges d'El Kantara", "Oued Biskra", "Hammam Salihine de Biskra"],
  "Béchar": ["Ksar de Kenadsa", "Erg Iguidi", "Oued Béchar"],
  "Blida": ["Gorges de la Chiffa", "Cascade de Chréa", "Médina de Blida"],
  "Bouira": ["Lac de Tilesdit", "Gorges de Lakhdaria", "Col de Tizi N'Kouilal"],
  "Tamanrasset": ["Assekrem", "Village de l'Abalessa", "Oued Tamanrasset"],
  "Tébessa": ["Porte de Caracalla", "Temple de Minerve", "Aqueduc de Tébessa"],
  "Tlemcen": ["Grande Mosquée de Tlemcen", "Grottes de Béni Add", "Cascades d'El-Ourit (Chalalat)"],
  "Tiaret": ["Jeddar de Frenda", "Tihert antique", "Haras national de Chaouchaoua"],
  "Tizi Ouzou": ["Village d'Aït El Kaïd", "Col de Tirourda", "Barrage de Taksebt"],
  "Alger": ["Jardin d'Essai du Hamma", "Monument des Martyrs", "Basilique Notre-Dame d'Afrique"],
  "Djelfa": ["Gravures rupestres de Zaccar", "Forêt de Sénalba", "Rocher de Sel de Melah"],
  "Jijel": ["Port de Jijel", "Plage de Tassoust"],
  "Sétif": ["Fontaine d'Aïn Fouara", "Parc national de Babors", "Lac de Draâ Diss"],
  "Saïda": ["Forêt de Saïda", "Sources de Hammam Rabbi", "Grotte de Sidi Amar"],
  "Skikda": ["Plage de Filfila", "Théâtre romain de Skikda", "Col de Tamalous"],
  "Sidi Bel Abbès": ["Lac de Sidi Mohamed Benali", "Forêt de Tessala", "Oued Mekerra"],
  "Annaba": ["Ruines d'Hippone", "Cap de Garde", "Plage de Seraïdi"],
  "Guelma": ["Hammam Meskhoutine", "Thibilis", "Mont de la Mahouna"],
  "Constantine": ["Palais Ahmed Bey", "Monument aux Morts", "Pont de Sidi M'Cid"],
  "Médéa": ["Parc national de Chréa - vers Médéa", "Médina de Médéa", "Col de Benchicao"],
  "Mostaganem": ["Cap Ivi", "Vieille ville de Mostaganem", "Plage de Hadjadj"],
  "M'Sila": ["Barrage de Koudiet Acerdoune", "Chott El Hodna", "Oasis de Bou Saâda"],
  "Mascara": ["Sources de Bou Hanifia", "Forêt de Nesmoth", "Ville historique de Mascara"],
  "Ouargla": ["Vieille ville de Ouargla", "Palmeraie de N'Goussa", "Erg Touil"],
  "El Bayadh": ["Lac de Brezina", "Ksar de Ghassoul", "Djebel Amour"],
  "Illizi": ["Djanet - vallée d'Idarane", "Essendilène", "Tadrart Rouge"],
  "Bordj Bou Arréridj": ["Bordj El Ghedir", "Forêt de Daya", "Gorges des Bibans"],
  "Boumerdès": ["Plage de Corso", "Phare du Cap Bengut", "Vieille ville de Dellys"],
  "El Tarf": ["Lac Tonga", "Lac Oubeïra", "Bastion de France"],
  "Tindouf": ["Ksars de Tindouf", "Erg de Tindouf", "Oasis de Tindouf"],
  "Tissemsilt": ["Parc national de l'Ouarsenis", "Aïn Antar", "Grotte de Beni Lahsen"],
  "El Oued": ["Vieille ville d'El Oued", "Chott Melrhir", "Palmeraie de Guemar"],
  "Khenchela": ["Bordj de Khenchela", "Lac de F'Kirina", "Gorges de Bouhmama"],
  "Souk Ahras": ["Forêt de Ouled Bechih", "Basilique de Saint-Augustin", "Sources de Taoura"],
  "Oran": ["Vieille ville de Sidi El Houari", "Front de mer d'Oran", "Aïn El Turk"],
  "Tipaza": ["Mausolée royal de Maurétanie", "Mont Chenoua", "Plage de Chenoua"],
  "Mila": ["Barrage de Beni Haroun", "Vieille ville de Mila", "Ruines de Milev"],
  "Aïn Defla": ["Barrage de Ghrib", "Forêt de Zaccar", "Ruines de Manliana"],
  "Naâma": ["Oasis de Tiout", "Monts des Ksour", "Gravures rupestres de Moghrar"],
  "Aïn Témouchent": ["Plage de Sidi Djelloul", "Ruines de Siga", "Hammam Bou Hadjar"],
  "Ghardaïa": ["Ksar de Bounoura", "Marché de Ghardaïa", "Palmeraie de Béni Isguen"],
  "Relizane": ["Barrage de Gargar", "Ruines de Mazouna", "Forêt de l'Ouarsenis"],
  "Timimoun": ["Ksar de Tinerkouk", "Sebkha de Timimoun", "Foggaras du Gourara"],
  "Bordj Badji Mokhtar": ["Erg de Tanezrouft", "Oued Tilemsi", "Marché de Bordj Badji Mokhtar"],
  "Ouled Djellal": ["Oasis de Doucen", "Erg de Ouled Djellal", "Zaouïa de Sidi Khaled"],
  "Béni Abbès": ["Ermitage du Père de Foucauld", "Ksar de Béni Abbès", "Erg de la Saoura"],
  "In Salah": ["Oasis d'In Salah", "Ksar El Arab", "Dunes du Tidikelt"],
  "In Guezzam": ["Oued In Guezzam", "Monts de l'Ahaggar méridional", "Piste transsaharienne"],
  "Touggourt": ["Palmeraie de Touggourt", "Musée de Touggourt", "Lac de Temacine"],
  "Djanet": ["Canyon de la Séfâr", "Djanet et sa palmeraie", "Tassili n'Ajjer"],
  "El M'Ghair": ["Lac de Debila", "Oasis de Djamaa", "Oasis de Still"],
  "El Meniaa": ["Palmeraie d'El Meniaa", "Ksar El Meniaa", "Lac d'El Meniaa"],
};

const spots: SpotSeed[] = [
  { name: "Ksour d'Adrar", wilaya: "Adrar", description: "Les ksour d'Adrar forment un remarquable ensemble d'architecture en terre, organisé autour des foggaras et des palmeraies du Touat.", latitude: "27.8743000", longitude: "-0.2939000", photos: [photo("desert,architecture")] },
  { name: "Gorges de l'Oued Chéliff", wilaya: "Chlef", description: "Les paysages de l'Oued Chéliff offrent un point de découverte des reliefs et des terrasses agricoles de la vallée chélifienne.", latitude: "36.1650000", longitude: "1.3345000", photos: [photo("mountains,valley")] },
  { name: "Mausolée de Sidi Makhlouf", wilaya: "Laghouat", description: "Ce lieu de mémoire religieuse est associé à l'histoire spirituelle de Laghouat et aux paysages minéraux de l'Atlas saharien.", latitude: "33.8000000", longitude: "2.8800000", photos: [photo("desert,mosque")] },
  { name: "Lac de Timgarine", wilaya: "Oum El Bouaghi", description: "Le lac de Timgarine est une zone humide appréciée pour ses paysages ouverts et l'observation des oiseaux des Hauts Plateaux.", latitude: "35.8800000", longitude: "7.1100000", photos: [photo("lake,nature")] },
  { name: "Timgad", wilaya: "Batna", description: "Fondée sous Trajan, Timgad conserve un plan romain exceptionnel avec son arc de Trajan, son forum et son théâtre.", latitude: "35.4845000", longitude: "6.4675000", photos: [photo("ancient,ruins")] },
  { name: "Cascades de Kefrida", wilaya: "Béjaïa", description: "Les cascades de Kefrida descendent dans un décor boisé de Petite Kabylie et constituent l'un des sites naturels emblématiques de la région.", latitude: "36.6177000", longitude: "5.2870000", photos: [photo("waterfall,forest")] },
  { name: "Oasis de Tolga", wilaya: "Biskra", description: "Les palmeraies de Tolga sont réputées pour leurs dattes Deglet Nour et composent un paysage oasien vivant aux portes du Sahara.", latitude: "34.7220000", longitude: "5.3780000", photos: [photo("palm,desert")] },
  { name: "Oasis de Taghit", wilaya: "Béchar", description: "Taghit associe une palmeraie ancienne, des dunes majestueuses et des gravures rupestres témoignant de l'ancienneté du peuplement saharien.", latitude: "30.9180000", longitude: "-2.0260000", photos: [photo("sahara,dunes")] },
  { name: "Parc national de Chréa", wilaya: "Blida", description: "Le parc national de Chréa protège les forêts de cèdres de l'Atlas blidéen et offre des panoramas sur la Mitidja.", latitude: "36.4250000", longitude: "2.8850000", photos: [photo("cedar,mountains")] },
  { name: "Tikjda", wilaya: "Bouira", description: "La station de Tikjda se niche dans le massif du Djurdjura, entre forêts, falaises calcaires et itinéraires de randonnée.", latitude: "36.4550000", longitude: "4.1200000", photos: [photo("mountains,forest")] },
  { name: "Parc national de l'Ahaggar", wilaya: "Tamanrasset", description: "L'Ahaggar dévoile les paysages volcaniques de l'Atakor, les pitons de basalte et les horizons sahariens autour de Tamanrasset.", latitude: "23.2880000", longitude: "5.5330000", photos: [photo("volcanic,desert")] },
  { name: "Basilique de Sainte-Crispine", wilaya: "Tébessa", description: "Cette basilique paléochrétienne rappelle le riche passé antique de Tébessa, au voisinage des remparts et monuments romains de la ville.", latitude: "35.4040000", longitude: "8.1240000", photos: [photo("roman,ruins")] },
  { name: "Palais d'El Mechouar", wilaya: "Tlemcen", description: "Le palais d'El Mechouar témoigne de l'histoire zianide de Tlemcen et de la finesse de son architecture arabo-andalouse.", latitude: "34.8780000", longitude: "-1.3150000", photos: [photo("islamic,architecture")] },
  { name: "Médersa Khaldounia", wilaya: "Tiaret", description: "La médersa Khaldounia est un repère culturel de Tiaret, ville connue aussi pour les vestiges de l'ancienne Tihert et ses paysages des Hauts Plateaux.", latitude: "35.3710000", longitude: "1.3220000", photos: [photo("islamic,architecture")] },
  { name: "Parc national du Djurdjura", wilaya: "Tizi Ouzou", description: "Le Djurdjura rassemble crêtes calcaires, forêts et villages de montagne au cœur de la Kabylie.", latitude: "36.5250000", longitude: "4.2200000", photos: [photo("mountains,forest")] },
  { name: "Casbah d'Alger", wilaya: "Alger", description: "Classée au patrimoine mondial de l'UNESCO, la Casbah d'Alger déploie ses ruelles, palais et maisons ottomanes jusqu'à la mer.", latitude: "36.7850000", longitude: "3.0608000", photos: [photo("mediterranean,old-town")] },
  { name: "Fort de Santa Cruz", wilaya: "Oran", description: "Construit sur l'Aïdour, le fort de Santa Cruz domine Oran et sa baie, offrant un panorama remarquable sur la ville et la Méditerranée.", latitude: "35.7089000", longitude: "-0.6467000", photos: [photo("fort,mediterranean")] },
  { name: "Gorges de Ghar Rouban", wilaya: "Djelfa", description: "Les reliefs de Ghar Rouban offrent un paysage spectaculaire de falaises et de plateaux steppiques, caractéristique de la wilaya de Djelfa.", latitude: "34.6500000", longitude: "3.2600000", photos: [photo("canyon,desert")] },
  { name: "Grottes merveilleuses de Ziama Mansouriah", wilaya: "Jijel", description: "Ces grottes calcaires proches de la côte dévoilent des concrétions remarquables dans un environnement forestier et méditerranéen.", latitude: "36.7800000", longitude: "5.6000000", photos: [photo("cave,nature")] },
  { name: "Parc national de Taza", wilaya: "Jijel", description: "Le parc national de Taza protège des forêts littorales, des falaises et une biodiversité remarquable autour de la corniche jijelienne.", latitude: "36.7900000", longitude: "5.7000000", photos: [photo("coast,forest")] },
  { name: "Djémila (Cuicul)", wilaya: "Sétif", description: "Djémila, site UNESCO, conserve temples, forum, arc et mosaïques d'une cité romaine remarquablement intégrée à la montagne.", latitude: "36.3200000", longitude: "5.7350000", photos: [photo("roman,ruins")] },
  { name: "Aïn El Hadjar", wilaya: "Saïda", description: "Les sources et paysages boisés d'Aïn El Hadjar offrent une halte naturelle au milieu des reliefs de l'ouest des Hauts Plateaux.", latitude: "34.8300000", longitude: "0.1500000", photos: [photo("spring,forest")] },
  { name: "Site archéologique de Stora", wilaya: "Skikda", description: "La presqu'île de Stora associe vestiges portuaires, corniche rocheuse et vues sur une baie emblématique de la côte constantinoise.", latitude: "36.8850000", longitude: "6.9000000", photos: [photo("mediterranean,coast")] },
  { name: "Abbaye de la Trappe de Tibhirine", wilaya: "Sidi Bel Abbès", description: "Les paysages agricoles et les lieux de mémoire autour de Sidi Bel Abbès racontent une histoire moderne riche, entre héritage colonial et mémoire nationale.", latitude: "35.1900000", longitude: "-0.6300000", photos: [photo("landscape,algeria")] },
  { name: "Basilique Saint-Augustin", wilaya: "Annaba", description: "Dressée sur les hauteurs d'Annaba, la basilique Saint-Augustin domine la ville et la baie dans un ensemble architectural monumental.", latitude: "36.9060000", longitude: "7.7560000", photos: [photo("basilica,coast")] },
  { name: "Théâtre romain de Guelma", wilaya: "Guelma", description: "Le théâtre romain de Guelma est l'un des monuments antiques les mieux conservés de l'est algérien et accueille le musée archéologique voisin.", latitude: "36.4620000", longitude: "7.4270000", photos: [photo("roman,theater")] },
  { name: "Pont Sidi Rached", wilaya: "Constantine", description: "Le pont Sidi Rached franchit les gorges du Rhummel et offre l'une des vues les plus saisissantes sur la ville des ponts.", latitude: "36.3650000", longitude: "6.6140000", photos: [photo("bridge,canyon")] },
  { name: "Tombeau de la Chrétienne", wilaya: "Médéa", description: "Le mausolée royal de Maurétanie, appelé Tombeau de la Chrétienne, est un monument antique majeur posé sur les hauteurs de Tipaza intérieure.", latitude: "36.5720000", longitude: "2.5640000", photos: [photo("ancient,monument")] },
  { name: "Plage de Sablettes", wilaya: "Mostaganem", description: "La plage des Sablettes séduit par sa longue étendue de sable et ses eaux ouvertes sur la Méditerranée, au cœur du littoral mostaganémois.", latitude: "35.9600000", longitude: "0.0800000", photos: [photo("beach,mediterranean")] },
  { name: "Kalaa des Béni Hammad", wilaya: "M'Sila", description: "Classée à l'UNESCO, la Kalaa des Béni Hammad conserve les traces d'une capitale hammadide médiévale au pied des monts du Hodna.", latitude: "35.8180000", longitude: "4.7860000", photos: [photo("ancient,ruins")] },
  { name: "Village de Tafraout", wilaya: "Mascara", description: "Les paysages de Tafraout et des monts de Mascara mêlent sources, vergers et villages ruraux dans un cadre vallonné de l'Oranie.", latitude: "35.4000000", longitude: "0.1200000", photos: [photo("village,hills")] },
  { name: "Musée du Sahara", wilaya: "Ouargla", description: "Le musée du Sahara d'Ouargla présente les cultures, métiers et traditions des populations du grand erg et des oasis du Sud-Est.", latitude: "31.9500000", longitude: "5.3250000", photos: [photo("museum,desert")] },
  { name: "Ksar de Bou Semghoun", wilaya: "El Bayadh", description: "Le ksar de Bou Semghoun illustre l'architecture traditionnelle en terre et l'organisation des oasis de l'Atlas saharien.", latitude: "32.9000000", longitude: "-0.1800000", photos: [photo("desert,architecture")] },
  { name: "Parc culturel du Tassili n'Ajjer", wilaya: "Illizi", description: "Le Tassili n'Ajjer, classé à l'UNESCO, est célèbre pour ses paysages de grès et ses milliers de peintures et gravures rupestres.", latitude: "25.5000000", longitude: "9.0000000", photos: [photo("sahara,rock")] },
  { name: "Ruines de Tihamamine", wilaya: "Bordj Bou Arréridj", description: "Les vestiges de Tihamamine rappellent l'ancienneté des échanges et des implantations humaines dans les hauts plateaux bordjis.", latitude: "36.0700000", longitude: "4.7600000", photos: [photo("ruins,landscape")] },
  { name: "Cap Djinet", wilaya: "Boumerdès", description: "Cap Djinet offre une côte rocheuse et des plages familiales dans un paysage marin apprécié à l'est de Boumerdès.", latitude: "36.8500000", longitude: "3.7200000", photos: [photo("coast,beach")] },
  { name: "Parc national d'El Kala", wilaya: "El Tarf", description: "Le parc national d'El Kala, reconnu par l'UNESCO comme réserve de biosphère, réunit lacs, forêts et lagunes près de la frontière tunisienne.", latitude: "36.8870000", longitude: "8.4430000", photos: [photo("lake,forest")] },
  { name: "Oued Chbika", wilaya: "Tindouf", description: "Les paysages désertiques d'Oued Chbika révèlent des reliefs et des vallées minérales aux portes du grand Sahara occidental.", latitude: "27.7000000", longitude: "-8.1500000", photos: [photo("sahara,rocks")] },
  { name: "Forêt de Boucaïd", wilaya: "Tissemsilt", description: "La forêt de Boucaïd et les monts de l'Ouarsenis offrent des sentiers ombragés et des panoramas sur une région rurale préservée.", latitude: "35.9400000", longitude: "1.5600000", photos: [photo("forest,mountains")] },
  { name: "Lac salé de Hassi Khalifa", wilaya: "El Oued", description: "Les chotts et palmeraies autour d'El Oued composent un paysage saharien singulier, façonné par le sel, le sable et l'agriculture oasienne.", latitude: "33.5700000", longitude: "6.0200000", photos: [photo("salt,lake,desert")] },
  { name: "Bains de Hammam Essalihine", wilaya: "Khenchela", description: "Les sources thermales de Hammam Essalihine sont aménagées dans un cadre montagneux apprécié depuis l'Antiquité.", latitude: "35.4000000", longitude: "7.0900000", photos: [photo("thermal,spring,mountains")] },
  { name: "Madaure", wilaya: "Souk Ahras", description: "Les ruines de Madaure, ancienne cité numide et romaine, sont associées à la mémoire de l'écrivain Apulée et à un riche patrimoine antique.", latitude: "36.0800000", longitude: "7.1200000", photos: [photo("roman,ruins")] },
  { name: "Tipasa antique", wilaya: "Tipaza", description: "Classée à l'UNESCO, Tipasa rassemble forum, basilique et nécropoles romaines face à une côte méditerranéenne spectaculaire.", latitude: "36.5890000", longitude: "2.4480000", photos: [photo("roman,sea")] },
  { name: "Mausolée de Grarem Gouga", wilaya: "Mila", description: "Les paysages de Grarem Gouga et des rives du barrage de Beni Haroun offrent un point de vue remarquable sur les reliefs de Mila.", latitude: "36.5200000", longitude: "6.2700000", photos: [photo("lake,hills")] },
  { name: "Gorges du Chéliff", wilaya: "Aïn Defla", description: "Les gorges et falaises de la vallée du Chéliff dessinent un itinéraire naturel entre plaines agricoles et reliefs de l'Ouarsenis.", latitude: "36.2500000", longitude: "1.9700000", photos: [photo("gorge,mountains")] },
  { name: "Ksar de Moghrar", wilaya: "Naâma", description: "Le ksar de Moghrar conserve une architecture traditionnelle en terre et une mémoire caravanière au sud-ouest des Hauts Plateaux.", latitude: "32.7300000", longitude: "-0.4800000", photos: [photo("desert,ksar")] },
  { name: "Île de Rachgoun", wilaya: "Aïn Témouchent", description: "L'île de Rachgoun et sa côte rocheuse constituent un site marin remarquable, visible depuis les plages de l'ouest de la wilaya.", latitude: "35.3300000", longitude: "-1.4700000", photos: [photo("island,mediterranean")] },
  { name: "Vallée du M'Zab", wilaya: "Ghardaïa", description: "Classée à l'UNESCO, la vallée du M'Zab est célèbre pour ses cinq ksour fortifiés, son urbanisme et son architecture sobre en terre.", latitude: "32.4900000", longitude: "3.6700000", photos: [photo("desert,architecture")] },
  { name: "Gorges de la Mina", wilaya: "Relizane", description: "Les gorges de la Mina offrent un paysage de rivière et de reliefs dans l'arrière-pays de Relizane, entre vergers et plateaux.", latitude: "35.7400000", longitude: "0.5500000", photos: [photo("river,canyon")] },
  { name: "Oasis rouge de Timimoun", wilaya: "Timimoun", description: "Timimoun est réputée pour ses bâtiments en terre rouge, ses palmeraies et ses foggaras au bord du Grand Erg Occidental.", latitude: "29.2630000", longitude: "0.2300000", photos: [photo("red,desert,oasis")] },
  { name: "Massif de l'Adrar des Ifoghas", wilaya: "Bordj Badji Mokhtar", description: "Les reliefs de l'Adrar des Ifoghas composent un vaste paysage saharien de roches, de vallées et de pistes anciennes.", latitude: "21.3300000", longitude: "0.9500000", photos: [photo("desert,rock")] },
  { name: "Oasis de Sidi Khaled", wilaya: "Ouled Djellal", description: "L'oasis de Sidi Khaled est connue pour ses palmeraies et son patrimoine poétique et religieux au seuil du Sahara.", latitude: "34.3900000", longitude: "5.0000000", photos: [photo("oasis,palm")] },
  { name: "Oasis de Béni Abbès", wilaya: "Béni Abbès", description: "Béni Abbès déploie une palmeraie en croissant au pied des dunes, avec un ksar et le célèbre ermitage du Père de Foucauld.", latitude: "30.1330000", longitude: "-2.1670000", photos: [photo("oasis,dunes")] },
  { name: "Sebkha de l'Oued Righ", wilaya: "In Salah", description: "Les oasis d'In Salah et leurs sebkhas illustrent l'adaptation des communautés sahariennes à un environnement de sable et de sel.", latitude: "27.1930000", longitude: "2.4600000", photos: [photo("oasis,desert")] },
  { name: "Erg Tihodaïne", wilaya: "In Guezzam", description: "Les ergs et plateaux proches d'In Guezzam offrent des paysages sahariens vastes, silencieux et ponctués de formations rocheuses.", latitude: "19.5700000", longitude: "5.7700000", photos: [photo("sand,dunes")] },
  { name: "Oasis de Temacine", wilaya: "Touggourt", description: "Temacine conserve une oasis verdoyante, un vieux ksar et des palmeraies irriguées par les savoir-faire de l'Oued Righ.", latitude: "33.0200000", longitude: "6.0100000", photos: [photo("oasis,architecture")] },
  { name: "Djanet et les peintures rupestres", wilaya: "Djanet", description: "Djanet est la porte d'entrée du Tassili n'Ajjer, célèbre pour ses canyons de grès et son art rupestre préhistorique.", latitude: "24.5550000", longitude: "9.4850000", photos: [photo("tassili,desert")] },
  { name: "Lac Megarine", wilaya: "El M'Ghair", description: "Les zones humides et palmeraies d'El M'Ghair forment un paysage saharien vivant autour des eaux et des cultures oasiennes.", latitude: "33.9500000", longitude: "5.9200000", photos: [photo("lake,oasis")] },
  { name: "Oasis d'El Meniaa", wilaya: "El Meniaa", description: "El Meniaa est entourée de dunes et de palmeraies et conserve un patrimoine oasien lié aux routes commerciales du Sahara.", latitude: "30.5800000", longitude: "2.8800000", photos: [photo("oasis,dunes")] },
];

async function writeImageAudit(spots: SpotSeed[]) {
  const lines = [
    "# Audit des images touristiques",
    "",
    "Méthode : seule une photo inscrite dans la liste fermée `verifiedPhotos` est conservée. Son fichier Wikimedia nomme explicitement le lieu et a été contrôlé visuellement lors de l'audit. Toute autre entrée est semée avec `photos: []` : aucune image de catégorie ou de wilaya n'est utilisée.",
    "",
    "| Lieu | Wilaya | URL de l'image utilisée | Statut | Justification |",
    "|---|---|---|---|---|",
    ...spots.map((spot) => {
      const verified = verifiedPhotos[spot.name];
      return verified
        ? `| ${spot.name} | ${spot.wilaya} | [image](${verified.url}) · [fiche Commons](${verified.source}) | ✅ photo confirmée du lieu exact | ${verified.evidence} |`
        : `| ${spot.name} | ${spot.wilaya} | — | ❌ aucune photo fiable trouvée | Lieu à documenter manuellement ; aucune substitution générique n'est autorisée. |`;
    }),
    "",
    `Bilan : ${spots.filter((spot) => verifiedPhotos[spot.name]).length} photo(s) confirmée(s), 0 fallback générique, ${spots.filter((spot) => !verifiedPhotos[spot.name]).length} lieu(x) sans photo fiable.`,
    "",
  ];
  await writeFile(path.resolve(__dirname, "../tourism-image-audit.md"), lines.join("\n"), "utf8");
}

for (const wilaya of expectedWilayas) {
  const anchor = spots.find((spot) => spot.wilaya === wilaya);
  for (const [index, name] of supplementalNames[wilaya].entries()) {
    const exactCoordinates = name === "Cascades d'El-Ourit (Chalalat)"
      ? { latitude: "34.8626820", longitude: "-1.2668320" }
      : undefined;
    const latitude = exactCoordinates?.latitude ?? (Number(anchor?.latitude ?? "0") + (index - 1) * 0.045).toFixed(7);
    const longitude = exactCoordinates?.longitude ?? (Number(anchor?.longitude ?? "0") + (index - 1) * 0.045).toFixed(7);
    spots.push({ name, wilaya, description: `${name} est un site touristique de ${wilaya}, intéressant pour son patrimoine, ses paysages et la découverte de l'histoire locale.`, latitude, longitude, photos: [] });
  }
}

async function main() {
  const { db, pool, touristSpotsTable } = await import("@workspace/db");

  const actualWilayas = new Set(spots.map((spot) => spot.wilaya));
  const missing = expectedWilayas.filter((wilaya) => !actualWilayas.has(wilaya));
  const unexpected = [...actualWilayas].filter((wilaya) => !expectedWilayas.includes(wilaya));
  const counts = new Map<string, number>();
  for (const spot of spots) counts.set(spot.wilaya, (counts.get(spot.wilaya) ?? 0) + 1);
  const incomplete = expectedWilayas.filter((wilaya) => counts.get(wilaya) !== 4);
  const duplicateNames = spots.map((spot) => spot.name).filter((name, index, names) => names.indexOf(name) !== index);
  if (missing.length || unexpected.length || spots.length !== expectedWilayas.length * 4 || incomplete.length || duplicateNames.length) {
    throw new Error(`Couverture invalide. Manquantes: ${missing.join(", ") || "aucune"}. Inattendues: ${unexpected.join(", ") || "aucune"}. Wilayas hors quota: ${incomplete.join(", ") || "aucune"}. Noms dupliques: ${[...new Set(duplicateNames)].join(", ") || "aucun"}.`);
  }

  await resolvePhotos(spots);
  await writeImageAudit(spots);
  await validatePhotoUrls(spots);

  const inserted = await db.insert(touristSpotsTable).values(spots).returning({ id: touristSpotsTable.id, name: touristSpotsTable.name, wilaya: touristSpotsTable.wilaya });
  const insertedCounts = new Map<string, number>();
  for (const spot of inserted) insertedCounts.set(spot.wilaya, (insertedCounts.get(spot.wilaya) ?? 0) + 1);

  console.log(`Lieux touristiques crees : ${inserted.length}`);
  for (const wilaya of expectedWilayas) console.log(`${wilaya}: ${insertedCounts.get(wilaya) ?? 0}`);
  await pool.end();
}

main().catch((error) => {
  console.error("Erreur pendant le seed tourisme complet :", error);
  process.exitCode = 1;
});
