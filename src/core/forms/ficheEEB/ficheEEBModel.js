import {
  faBuilding,
  faCheck,
  faHouse,
  faTimes,
  faCheckCircle,
  faMars,
  faVenus,
} from 'react-native-fontawesome';
import moment from 'moment';
import * as theme from '../../theme';

export const ficheEEBModel = [
  //*********************** STEP1 *************************
  {
    //0 DONE
    id: 'fullName',
    title: 'NOM ET PRENOM',
    fields: [
      {
        id: 'nameSir',
        type: 'textInput',
        label: 'Monsieur',
        errorId: 'nameSirError',
        pdfConfig: {dx: -520, dy: -155, pageIndex: 1},
      },
      {
        id: 'nameMiss',
        type: 'textInput',
        label: 'Madame',
        errorId: 'nameMissError',
        pdfConfig: {dx: -235, dy: -155, pageIndex: 1},
      },
    ],
    exclusiveMendatory: true,
    stepIndex: 0,
  },
  {
    //1 DONE
    id: 'proSituation',
    title: 'SITUATION',
    fields: [
      {
        id: 'proSituationSir',
        type: 'picker',
        items: [
          {label: 'Choisir', value: '', pdfConfig: {skip: true}},
          {label: 'Salarié privé', value: 'Salarié privé'},
          {label: 'Salarié public', value: 'Salarié public'},
          {label: 'Retraité', value: 'Retraité'},
          {label: 'Sans emploi', value: 'Sans emploi'},
          {label: 'Invalidité', value: 'Invalidité'},
          {label: 'Profession libérale', value: 'Profession libérale'},
          {label: "Chef d'entreprise", value: "Chef d'entreprise"},
          {label: 'Autre', value: 'Autre'},
        ],
        label: 'Situation professionnelle Mr',
        mendatory: true,
        errorId: 'proSituationSirError',
        isConditional: true,
        condition: {with: 'nameSir'},
        pdfConfig: {dx: -450, dy: -305, pageIndex: 1},
      },
      {
        id: 'ageSir',
        type: 'textInput',
        isNumeric: true,
        label: 'Age Mr',
        errorId: 'ageSirError',
        mendatory: true,
        isConditional: true,
        condition: {with: 'nameSir'},
        pdfConfig: {dx: -510, dy: -330, pageIndex: 1},
      },
      {
        id: 'proSituationMiss',
        type: 'picker',
        items: [
          {label: 'Choisir', value: '', pdfConfig: {skip: true}},
          {label: 'Salarié privé', value: 'Salarié privé'},
          {label: 'Salarié public', value: 'Salarié public'},
          {label: 'Retraité', value: 'Retraité'},
          {label: 'Sans emploi', value: 'Sans emploi'},
          {label: 'Invalidité', value: 'Invalidité'},
          {label: 'Profession libérale', value: 'Profession libérale'},
          {label: "Chef d'entreprise", value: "Chef d'entreprise"},
          {label: 'Autre', value: 'Autre'},
        ],
        label: 'Situation professionnelle Mme',
        errorId: 'proSituationMissError',
        mendatory: true,
        isConditional: true,
        condition: {with: 'nameMiss'},
        pdfConfig: {dx: -150, dy: -305, pageIndex: 1},
      },
      {
        id: 'ageMiss',
        type: 'textInput',
        isNumeric: true,
        label: 'Age Mme',
        errorId: 'ageMissError',
        mendatory: true,
        isConditional: true,
        condition: {with: 'nameMiss'},
        pdfConfig: {dx: -225, dy: -330, pageIndex: 1},
      },
    ],
  },
  {
    //2 DONE
    id: 'familySituation',
    title: 'SITUATION',
    fields: [
      {
        id: 'familySituation',
        label: 'Situation de famille',
        type: 'options',
        items: [
          {
            label: 'Célibataire',
            value: 'Célibataire',
            icon: faCheckCircle,
            pdfConfig: {dx: -473, dy: -350, pageIndex: 1},
          },
          {
            label: 'Marié',
            value: 'Marié',
            icon: faCheckCircle,
            pdfConfig: {dx: -395, dy: -350, pageIndex: 1},
          },
          {
            label: 'Pacsé',
            value: 'Pacsé',
            icon: faCheckCircle,
            pdfConfig: {dx: -339, dy: -350, pageIndex: 1},
          },
          {
            label: 'Concubinage',
            value: 'Concubinage',
            icon: faCheckCircle,
            pdfConfig: {dx: -282, dy: -350, pageIndex: 1},
          },
          {
            label: 'Divorcé',
            value: 'Divorcé',
            icon: faCheckCircle,
            pdfConfig: {dx: -204, dy: -350, pageIndex: 1},
          },
          {
            label: 'Veuve',
            value: 'Veuve',
            icon: faCheckCircle,
            pdfConfig: {dx: -140, dy: -350, pageIndex: 1},
          },
        ],
      },
    ],
  },
  {
    //3 DONE
    id: 'houseOwnership',
    title: 'SITUATION',
    fields: [
      {
        id: 'houseOwnership',
        label: 'Propriétaire ou locataire',
        type: 'options',
        items: [
          {
            label: 'Propriétaire',
            value: 'Propriétaire',
            icon: faCheckCircle,
            pdfConfig: {dx: -445, dy: -387, pageIndex: 1},
          },
          {
            label: 'Locataire',
            value: 'Locataire',
            icon: faCheckCircle,
            pdfConfig: {dx: -523, dy: -387, pageIndex: 1},
          },
        ],
        errorId: 'houseOwnershipError',
        mendatory: true,
      },
    ],
  },
  {
    //4
    id: 'yearsHousing',
    title: 'SITUATION',
    fields: [
      {
        id: 'yearsHousing',
        label: 'Depuis combien de temps habitez-vous ici ?',
        type: 'number',
        errorId: 'yearsHousingError',
        pdfConfig: {dx: -220, dy: -386, pageIndex: 1},
      },
    ],
  },
  {
    //5 DONE
    id: 'taxIncome',
    title: 'SITUATION',
    fields: [
      {
        id: 'taxIncome',
        type: 'textInput',
        isNumeric: true,
        label: 'Revenu fiscal de référence en € du foyer',
        errorId: 'taxIncomeError',
        mendatory: true,
        pdfConfig: {dx: -447, dy: -405, pageIndex: 1},
        instruction: {
          priority: 'high',
          message: 'Cumulez les revenus fiscaux de tous les occupants du foyer',
        },
      },
    ],
  },
  {
    //6 DONE
    id: 'demographicSituation',
    title: 'SITUATION',
    fields: [
      {
        id: 'familyMembersCount',
        type: 'textInput',
        isNumeric: true,
        label: "Nombre d'occupants dans le foyer",
        errorId: 'familyMembersCountError',
        mendatory: true,
        pdfConfig: {dx: -425, dy: -443, pageIndex: 1},
      },
      {
        id: 'childrenCount',
        type: 'textInput',
        isNumeric: true,
        label: "Nombre d'enfants à charge (-18 ans)",
        errorId: 'childrenCountError',
        mendatory: true,
        pdfConfig: {dx: -150, dy: -443, pageIndex: 1},
      },
    ],
  },
  {
    //7
    id: 'aidAndSub',
    title: 'AIDES ET SUVENTIONS',
    fields: [
      {
        id: 'aidAndSub',
        label:
          "Avez-vous bénéficié d'aides ou subventions dans les 5 dernières années ?",
        type: 'options',
        items: [
          {
            label: 'Non',
            value: 'Non',
            icon: faTimes,
            iconColor: theme.colors.error,
            pdfConfig: {dx: -190, dy: -484, pageIndex: 1},
            rollBack: {
              fields: [
                {id: 'aidAndSubWorksType', type: 'string'},
                {id: 'aidAndSubWorksCost', type: 'string'},
              ],
            },
          },
          {
            label: 'Oui',
            value: 'Oui',
            icon: faCheck,
            iconColor: 'green',
            pdfConfig: {dx: -247, dy: -484, pageIndex: 1},
          },
        ],
        errorId: 'aidAndSubError',
        mendatory: true,
      },
      {
        id: 'aidAndSubWorksType',
        type: 'picker',
        items: [
          {label: 'Choisir', value: '', pdfConfig: {skip: true}},
          {label: 'Chauffage', value: 'Chauffage'},
          {label: 'Eau chaude', value: 'Eau chaude'},
          {label: 'Isolation', value: 'Isolation'},
          {label: 'Autre', value: 'Autre'},
        ],
        label: 'Nature des travaux',
        errorId: 'aidAndSubWorksTypeError',
        style: {marginTop: 32},
        isConditional: true,
        condition: {with: 'aidAndSub', values: ['Oui']},
        pdfConfig: {dx: -490, dy: -502, pageIndex: 1},
      },
      {
        id: 'aidAndSubWorksCost',
        type: 'textInput',
        isNumeric: true,
        label: 'Montant total des travaux',
        errorId: 'aidAndSubWorksCostError',
        style: {marginTop: 32},
        mendatory: true,
        isConditional: true,
        condition: {with: 'aidAndSub', values: ['Oui']},
        pdfConfig: {dx: -130, dy: -502, pageIndex: 1},
      },
    ],
    isLast: true,
  },
  //********************  STEP 2 *********************************************
  {
    //8 DONE
    id: 'housingType',
    title: 'HABITATION',
    fields: [
      {
        id: 'housingType',
        label: "Type d'habitation",
        type: 'options',
        items: [
          {
            label: 'Maison individuelle',
            value: 'Maison individuelle',
            icon: faHouse,
            pdfConfig: {dx: -466, dy: -597, pageIndex: 1},
          },
          {
            label: 'Appartement',
            value: 'Appartement',
            icon: faBuilding,
            pdfConfig: {dx: -325, dy: -597, pageIndex: 1},
          },
        ],
        errorId: 'housingTypeError',
        mendatory: true,
      },
    ],
    isFirst: true,
    stepIndex: 1,
  },
  {
    //9 DONE
    id: 'surfaces',
    title: 'HABITATION',
    fields: [
      // {
      //     id: "landSurface",
      //     type: "textInput",
      //     isNumeric: true,
      //     label: "Surface du terrain en m²",
      //     errorId: "landSurfaceError",
      //     mendatory: true,
      //     pdfConfig: { dx: -490, dy: - 615, pageIndex: 1 }
      // },
      {
        id: 'livingSurface',
        type: 'textInput',
        isNumeric: true,
        label: 'Surface habitable en m²',
        errorId: 'livingSurfaceError',
        mendatory: true,
        pdfConfig: {dx: -332, dy: -615, pageIndex: 1},
      },
      {
        id: 'heatedSurface',
        type: 'textInput',
        isNumeric: true,
        label: 'Surface à chauffer en m²',
        errorId: 'heatedSurfaceError',
        mendatory: true,
        pdfConfig: {dx: -330, dy: -633, pageIndex: 1},
      },
    ],
  },
  {
    //10 DONE
    id: 'yearHomeConstruction',
    title: 'HABITATION',
    fields: [
      {
        id: 'yearHomeConstruction',
        label: "Année de construction de l'habitation",
        type: 'number',
        errorId: 'yearHomeConstructionError',
        pdfConfig: {dx: -70, dy: -615, pageIndex: 1},
      },
    ],
  },
  {
    //11
    id: 'roofType',
    title: 'HABITATION',
    fields: [
      {
        id: 'roofType',
        label: 'Type de toit',
        type: 'options',
        items: [
          {
            label: 'Toit-terasse',
            value: 'Toit-terasse',
            icon: faCheckCircle,
            pdfConfig: {dx: -509, dy: -671, pageIndex: 1},
          },
          {
            label: 'Combles aménagés',
            value: 'Combles aménagés',
            icon: faCheckCircle,
            pdfConfig: {dx: -417, dy: -671, pageIndex: 1},
          },
          {
            label: 'Combles perdus',
            value: 'Combles perdus',
            icon: faCheckCircle,
            pdfConfig: {dx: -296, dy: -671, pageIndex: 1},
          },
          {
            label: 'Terasses+Combles',
            value: 'Terasses+Combles',
            icon: faCheckCircle,
            pdfConfig: {dx: -190, dy: -671, pageIndex: 1},
          },
        ],
        errorId: 'roofTypeError',
        mendatory: true,
      },
    ],
  },
  // {//12
  //     id: "cadastralRef",
  //     title: "HABITATION",
  //     fields: [
  //         {
  //             id: "cadastralRef",
  //             type: "textInput",
  //             label: "Référence cadastrale",
  //             errorId: "cadastralRefError",
  //             pdfConfig: { dx: -475, dy: - 700, pageIndex: 1 }
  //         },
  //     ]
  // },
  {
    //13
    id: 'livingLevelsCount',
    title: 'HABITATION',
    fields: [
      {
        id: 'livingLevelsCount',
        label: 'Nombre de niveaux habitables',
        type: 'options',
        items: [
          {
            label: 'RDC',
            value: 'RDC',
            icon: faCheckCircle,
            pdfConfig: {dx: -409, dy: -720, pageIndex: 1},
          },
          {
            label: 'R+1',
            value: 'R+1',
            icon: faCheckCircle,
            pdfConfig: {dx: -374, dy: -720, pageIndex: 1},
          },
          {
            label: 'R+2',
            value: 'R+2',
            icon: faCheckCircle,
            pdfConfig: {dx: -339, dy: -720, pageIndex: 1},
          },
          {
            label: 'R+3',
            value: 'R+3',
            icon: faCheckCircle,
            pdfConfig: {dx: -303, dy: -720, pageIndex: 1},
          },
        ],
        errorId: 'livingLevelsCountError',
        mendatory: true,
      },
    ],
  },
  {
    //14
    id: 'roomsCount',
    title: 'HABITATION',
    fields: [
      {
        id: 'roomsCount',
        label: 'Nombres de pièces à vivre',
        type: 'number',
        errorId: 'roomsCountError',
        mendatory: true,
        pdfConfig: {dx: -120, dy: -720, pageIndex: 1},
      },
    ],
  },
  {
    //15
    id: 'ceilingHeight',
    title: 'HABITATION',
    fields: [
      {
        id: 'ceilingHeight',
        type: 'textInput',
        isNumeric: true,
        label: 'Hauteur sous-plafond en cm',
        errorId: 'ceilingHeightError',
        mendatory: true,
        pdfConfig: {dx: -475, dy: -737, pageIndex: 1},
      },
    ],
  },
  {
    //20
    id: 'isParkingMinFourMetersSqr',
    title: 'HABITATION',
    fields: [
      {
        id: 'isParkingMinFourMetersSqr',
        label: 'Garage ou dépendance avec disponibilité de plus de 4m2 ?',
        type: 'options',
        items: [
          {
            label: 'Non',
            value: 'Non',
            icon: faTimes,
            iconColor: theme.colors.error,
            pdfConfig: {skip: true},
          },
          {
            label: 'Oui',
            value: 'Oui',
            icon: faCheck,
            iconColor: 'green',
            pdfConfig: {skip: true},
          },
        ],
        errorId: 'isParkingMinFourMetersSqrError',
        mendatory: true,
      },
    ],
  },
  {
    //17
    id: 'basementType',
    title: 'HABITATION',
    fields: [
      {
        id: 'basementType',
        label: 'Type de sous-sol',
        type: 'options',
        items: [
          {
            label: 'Cave',
            value: 'Cave',
            icon: faCheckCircle,
            pdfConfig: {dx: -452, dy: -795, pageIndex: 1},
          },
          {
            label: 'Terre-plein',
            value: 'Terre-plein',
            icon: faCheckCircle,
            pdfConfig: {dx: -381, dy: -795, pageIndex: 1},
          },
          {
            label: 'Vide sanitaire',
            value: 'Vide sanitaire',
            icon: faCheckCircle,
            pdfConfig: {dx: -303, dy: -795, pageIndex: 1},
          },
          {
            label: 'Aucun',
            value: 'Aucun',
            icon: faCheckCircle,
            pdfConfig: {dx: -225, dy: -795, pageIndex: 1},
          },
        ],
        errorId: 'basementTypeError',
        mendatory: true,
      },
    ],
    isLast: true,
  },
  //***************************** STEP 3 ************************
  {
    //18
    id: 'wallMaterial',
    title: 'VOTRE BILAN ENERGETIQUE',
    fields: [
      {
        id: 'wallMaterial',
        label: 'Matériaux de construction des murs',
        type: 'options',
        items: [
          {
            label: 'Pierre',
            value: 'Pierre',
            icon: faCheckCircle,
            pdfConfig: {dx: -396, dy: -104, pageIndex: 0},
          },
          {
            label: 'Béton',
            value: 'Béton',
            icon: faCheckCircle,
            pdfConfig: {dx: -319, dy: -104, pageIndex: 0},
          },
          {
            label: 'Béton celullaire',
            value: 'Béton celullaire',
            icon: faCheckCircle,
            pdfConfig: {dx: -240, dy: -104, pageIndex: 0},
          },
          {
            label: 'Brique',
            value: 'Brique',
            icon: faCheckCircle,
            pdfConfig: {dx: -396, dy: -117, pageIndex: 0},
          },
          {
            label: 'Bois',
            value: 'Bois',
            icon: faCheckCircle,
            pdfConfig: {dx: -319, dy: -117, pageIndex: 0},
          },
          {
            label: 'Autre',
            value: 'Autre',
            icon: faCheckCircle,
            pdfConfig: {dx: -240, dy: -117, pageIndex: 0},
          },
        ],
        errorId: 'wallMaterialError',
        mendatory: true,
      },
    ],
    isFirst: true,
    stepIndex: 2,
  },
  {
    //19
    id: 'wallThickness',
    title: 'VOTRE BILAN ENERGETIQUE',
    fields: [
      {
        id: 'wallThickness',
        type: 'textInput',
        isNumeric: true,
        label: 'Epaisseur des murs en cm',
        errorId: 'wallThicknessError',
        pdfConfig: {dx: -485, dy: -135, pageIndex: 0},
      },
    ],
  },
  {
    //20
    id: 'internalWallsIsolation',
    title: 'VOTRE BILAN ENERGETIQUE',
    fields: [
      {
        id: 'internalWallsIsolation',
        label: 'Isolation des murs interieurs',
        type: 'options',
        items: [
          {
            label: 'Non',
            value: 'Non',
            icon: faTimes,
            iconColor: theme.colors.error,
            pdfConfig: {dx: -318, dy: -154, pageIndex: 0},
          },
          {
            label: 'Oui',
            value: 'Oui',
            icon: faCheck,
            iconColor: 'green',
            pdfConfig: {dx: -396, dy: -154, pageIndex: 0},
          },
        ],
        errorId: 'internalWallsIsolationError',
        mendatory: true,
      },
    ],
  },
  {
    //21
    id: 'externalWallsIsolation',
    title: 'VOTRE BILAN ENERGETIQUE',
    fields: [
      {
        id: 'externalWallsIsolation',
        label: 'Isolation des murs exterieurs',
        type: 'options',
        items: [
          {
            label: 'Non',
            value: 'Non',
            icon: faTimes,
            iconColor: theme.colors.error,
            pdfConfig: {dx: -318, dy: -172, pageIndex: 0},
          },
          {
            label: 'Oui',
            value: 'Oui',
            icon: faCheck,
            iconColor: 'green',
            pdfConfig: {dx: -396, dy: -172, pageIndex: 0},
          },
        ],
        errorId: 'externalWallsIsolationError',
        mendatory: true,
      },
    ],
  },
  { //22
      id: "floorIsolation",
      title: "VOTRE BILAN ENERGETIQUE",
      fields: [
          {
              id: "floorIsolation",
              label: "Isolation du sol",
              type: "options",
              items: [
                  { label: 'Non', value: 'Non', icon: faTimes, iconColor: theme.colors.error, pdfConfig: { dx: -318, dy: - 191, pageIndex: 0 } },
                  { label: 'Oui', value: 'Oui', icon: faCheck, iconColor: "green", pdfConfig: { dx: -396, dy: - 191, pageIndex: 0 } },
              ],
              errorId: "floorIsolationError",
              mendatory: true
          }
      ],
  },
  { //22
      id: "lostAticsIsolation",
      title: "VOTRE BILAN ENERGETIQUE",
      fields: [
          {
              id: "lostAticsIsolation",
              label: "Isolation des combles perdus",
              type: "options",
              items: [
                  {
                      label: 'Non', value: 'Non', icon: faTimes, iconColor: theme.colors.error, pdfConfig: { dx: -318, dy: - 209, pageIndex: 0 },
                      rollBack: {
                          fields: [
                              { id: "lostAticsIsolationMaterial", type: "array" },
                              { id: "lostAticsIsolationAge", type: "string" },
                              { id: "lostAticsIsolationThickness", type: "string" },
                              { id: "lostAticsSurface", type: "string" }
                          ]
                      }
                  },
                  { label: 'Oui', value: 'Oui', icon: faCheck, iconColor: "green", pdfConfig: { dx: -396, dy: - 209, pageIndex: 0 } },
              ],
              errorId: "lostAticsIsolationError",
              mendatory: true
          },
          {
              id: "lostAticsIsolationMaterial",
              label: "Matériaux des combles perdus",
              type: "options",
              isMultiOptions: true,
              items: [
                  { label: 'Laine de verre', value: 'Laine de verre', icon: faCheckCircle, pdfConfig: { dx: -507, dy: - 228, pageIndex: 0 } },
                  { label: 'Laine de roche', value: 'Laine de roche', icon: faCheckCircle, pdfConfig: { dx: -396, dy: - 228, pageIndex: 0 } },
                  { label: 'Autre', value: 'Autre', icon: faCheckCircle, pdfConfig: { dx: -278, dy: - 228, pageIndex: 0 } }, //#task scroll to error offset_y
              ],
              style: { marginTop: 100 },
              isConditional: true,
              condition: { with: "lostAticsIsolation", values: ["Oui"] }
          },
          {
              id: "lostAticsIsolationAge",
              label: "Age de l'isolation",
              type: "number",
              errorId: "lostAticsIsolationAgeError",
              mendatory: true,
              isConditional: true,
              condition: { with: "lostAticsIsolation", values: ["Oui"] },
              pdfConfig: { dx: -495, dy: - 263, pageIndex: 0 }
          },
          {
              id: "lostAticsIsolationThickness",
              label: "Epaisseur (en cm)",
              type: "number",
              isConditional: true,
              condition: { with: "lostAticsIsolation", values: ["Oui"] },
              pdfConfig: { dx: -523, dy: - 247, pageIndex: 0 }
          },
          {
              id: "lostAticsSurface",
              label: "Surface des combles",
              type: "number",
              mendatory: true,
              errorId: "lostAticsSurfaceError",
              isConditional: true,
              condition: { with: "lostAticsIsolation", values: ["Oui"] },
              pdfConfig: { dx: -240, dy: - 263, pageIndex: 0 }
          }
      ],
  },
  { //23
      id: "windowType",
      title: "MENUISERIE",
      fields: [
          {
              id: "windowType",
              label: "Type de fenêtre",
              type: "options",
              items: [
                  { label: 'PVC', value: 'PVC', icon: faCheckCircle, pdfConfig: { dx: -396, dy: - 328, pageIndex: 0 } },
                  { label: 'Bois', value: 'Bois', icon: faCheckCircle, pdfConfig: { dx: -318, dy: - 328, pageIndex: 0 } },
                  { label: 'Alu', value: 'Alu', icon: faCheckCircle, pdfConfig: { dx: -240, dy: - 328, pageIndex: 0 } },
              ],
              errorId: "windowTypeError",
              mendatory: true
          }
      ],
  },
  { //24
      id: "glazingType",
      title: "MENUISERIE",
      fields: [
          {
              id: "glazingType",
              label: "Type de vitrage",
              type: "options",
              items: [
                  { label: 'Simple', value: 'Simple', icon: faCheckCircle, pdfConfig: { dx: -396, dy: - 347, pageIndex: 0 } },
                  { label: 'Double', value: 'Double', icon: faCheckCircle, pdfConfig: { dx: -318, dy: - 347, pageIndex: 0 } },
                  { label: 'Triple', value: 'Triple', icon: faCheckCircle, pdfConfig: { dx: -240, dy: - 347, pageIndex: 0 } },
              ],
              errorId: "glazingTypeError",
              mendatory: true
          }
      ]
  },
  { //25
      id: "hotWaterProduction",
      title: "EAU CHAUDE SANITAIRE",
      fields: [
          {
              id: "hotWaterProduction",
              label: "Production d'eau chaude sanitaire",
              type: "options",
              isMultiOptions: true,
              items: [
                  { label: 'Chaudière', value: 'Chaudière', icon: faCheckCircle, pdfConfig: { dx: -396, dy: - 416, pageIndex: 0 } },
                  { label: 'Cumulus électrique', value: 'Cumulus électrique', icon: faCheckCircle, pdfConfig: { dx: -304, dy: - 416, pageIndex: 0 } },
                  { label: 'Chauffe-eau solaire', value: 'Chauffe-eau solaire', icon: faCheckCircle, pdfConfig: { dx: -190, dy: - 416, pageIndex: 0 } },
                  { label: 'Pompe à chaleur', value: 'Pompe à chaleur', icon: faCheckCircle, pdfConfig: { dx: -396, dy: - 435, pageIndex: 0 } },
                  { label: 'Thermodynamique', value: 'Thermodynamique', icon: faCheckCircle, pdfConfig: { dx: -304, dy: - 435, pageIndex: 0 } },
              ],
          }
      ],
  },
  { //26
      id: "yearInstallationHotWater",
      title: "EAU CHAUDE SANITAIRE",
      fields: [
          {
              id: "yearInstallationHotWater",
              label: "Année d'installation du dernier équipement",
              type: "number",
              pdfConfig: { dx: -90, dy: - 434, pageIndex: 0 }
          }
      ]
  },
  {//27 TODO
      id: "heaters",
      title: "CHAUFFAGE",
      fields: [
          {
              id: "heaters",
              type: "picker",
              items: [ //Radiateur, Chaudière, Poêle, Insert/cheminée, Pompe à chaleur
                  { label: "Selectionner un type", value: "", pdfConfig: { skip: true } },
                  { label: "Radiateur", value: "Radiateur", pdfConfig: { dx: -453, dy: - 499, pageIndex: 0 } },
                  { label: "Chaudière", value: "Chaudière", pdfConfig: { dx: -375, dy: - 499, pageIndex: 0 } },
                  { label: "Insert/cheminée", value: "Insert/cheminée", pdfConfig: { dx: -311, dy: - 499, pageIndex: 0 } },
                  { label: "Pompe à chaleur", value: "Pompe à chaleur", pdfConfig: { dx: -240, dy: - 499, pageIndex: 0 } },
                  { label: "Poêle", value: "Poêle", pdfConfig: { dx: -375, dy: - 517, pageIndex: 0 } },
              ],
              label: "Types de chauffage",
              mendatory: true,
              errorId: "heatersError",
              style: { marginBottom: 32 },
              rollBack: { fields: [{ id: "transmittersTypes", type: "array" }] }
          },
          {
              id: "energySource",
              type: "picker",
              items: [
                  { label: "Selectionner un type", value: "", pdfConfig: { skip: true } },
                  { label: "Electrique", value: "Electrique", pdfConfig: { dx: -453, dy: - 499, pageIndex: 0 } },
                  { label: "Gaz", value: "Gaz", pdfConfig: { dx: -375, dy: - 499, pageIndex: 0 } },
                  { label: "Fioul", value: "Fioul", pdfConfig: { dx: -311, dy: - 499, pageIndex: 0 } },
                  { label: "Bois", value: "Bois", pdfConfig: { dx: -311, dy: - 517, pageIndex: 0 } },
                  { label: "Autre", value: "Autre", pdfConfig: { dx: -240, dy: - 517, pageIndex: 0 } },
              ],
              label: "Source d'énergie",
              mendatory: true,
              errorId: "energySourceError",
              style: { marginBottom: 32 },
              rollBack: { fields: [{ id: "transmittersTypes", type: "array" }] }
          },
          {
              id: "transmittersTypes",
              label: "Types d'émetteurs",
              type: "options",
              isMultiOptions: true,
              items: [
                  { label: 'Radiateurs électriques', value: 'Radiateurs électriques', icon: faCheckCircle, isConditional: true, condition: { with: "energySource", values: ["Electrique", "Poêle", "Autre"] }, pdfConfig: { dx: -453, dy: - 536, pageIndex: 0 } },
                  { label: 'Clim réversible', value: 'Clim réversible', icon: faCheckCircle, isConditional: true, condition: { with: "energySource", values: ["Electrique", "Poêle", "Autre"] }, pdfConfig: { dx: -311, dy: - 554, pageIndex: 0 } },
                  { label: 'Radiateur inertie', value: 'Radiateur inertie', icon: faCheckCircle, isConditional: true, condition: { with: "energySource", values: ["Electrique"] }, pdfConfig: { dx: -265, dy: - 536, pageIndex: 0 } },
                  { label: 'Radiateur fonte', value: 'Radiateur fonte', icon: faCheckCircle, isConditional: true, condition: { with: "energySource", values: ["Gaz", "Fioul", "Bois", "Pompe à chaleur", "Chaudière"] }, pdfConfig: { dx: -265, dy: - 536, pageIndex: 0 } },
                  { label: 'Radiateur alu', value: 'Radiateur alu', icon: faCheckCircle, isConditional: true, condition: { with: "energySource", values: ["Gaz", "Fioul", "Bois", "Pompe à chaleur", "Chaudière"] }, pdfConfig: { dx: -230, dy: - 536, pageIndex: 0 } },
                  { label: 'Radiateur acier', value: 'Radiateur acier', icon: faCheckCircle, isConditional: true, condition: { with: "energySource", values: ["Gaz", "Fioul", "Bois", "Pompe à chaleur", "Chaudière"] }, pdfConfig: { dx: -205, dy: - 536, pageIndex: 0 } },
                  { label: 'Chauffage au sol', value: 'Chauffage au sol', icon: faCheckCircle, isConditional: true, condition: { with: "energySource", values: ["Gaz", "Fioul", "Bois", "Pompe à chaleur", "Chaudière"] }, pdfConfig: { dx: -155, dy: - 536, pageIndex: 0 } },
                  { label: 'Convecteur', value: 'Convecteur', icon: faCheckCircle, isConditional: true, condition: { with: "energySource", values: ["Poêle", "Autre"] }, pdfConfig: { dx: -453, dy: - 554, pageIndex: 0 } },
                  { label: 'Autre', value: 'Autre', icon: faCheckCircle, isConditional: true, condition: { with: "energySource", values: ["Poêle", "Gaz", "Fioul", "Bois", "Autre"] }, pdfConfig: { dx: -155, dy: - 554, pageIndex: 0 } },
              ],
          }
      ]
  },
  { //28
      id: "yearInstallationHeaters",
      title: "CHAUFFAGE",
      fields: [
          {
              id: "yearInstallationHeaters",
              label: "Année d'installation du dernier équipement",
              type: "number",
              pdfConfig: { dx: -485, dy: - 573, pageIndex: 0 }
          }
      ]
  },
  { //29
      id: "idealTemperature",
      title: "CHAUFFAGE",
      fields: [
          {
              id: "idealTemperature",
              label: "Quelle est votre température idéale de confort ?",
              type: "number",
              pdfConfig: { dx: -227, dy: - 573, pageIndex: 0 }
          }
      ]
  },
  { //30
      id: "isMaintenanceContract",
      title: "CHAUFFAGE",
      fields: [
          {
              id: "isMaintenanceContract",
              label: "Contrat de maintenance",
              type: "options",
              items: [
                  { label: 'Non', value: 'Non', icon: faTimes, iconColor: theme.colors.error, pdfConfig: { dx: -403, dy: - 592, pageIndex: 0 } },
                  { label: 'Oui', value: 'Oui', icon: faCheck, iconColor: "green", pdfConfig: { dx: -453, dy: - 592, pageIndex: 0 } },
              ],
              errorId: "isMaintenanceContractError",
              mendatory: true,
          }
      ],
  },
  { //31
      id: "isElectricityProduction",
      title: "PRODUCTION D'ENERGIE",
      fields: [
          {
              id: "isElectricityProduction",
              label: "Produisez-vous déjà de l'électricité par une source d'énergie renouvelable ?",
              type: "options",
              items: [
                  {
                      label: 'Non',
                      value: 'Non',
                      icon: faTimes,
                      iconColor: theme.colors.error,
                      pdfConfig: { skip: true },
                      rollBack: {
                          fields: [
                              { id: "elecProdType", type: "string" },
                              { id: "elecProdInstallYear", type: "string" },
                              { id: "energyUsage", type: "string" }
                          ]
                      }
                  },
                  {
                      label: 'Oui',
                      value: 'Oui',
                      icon: faCheck,
                      iconColor: "green",
                      pdfConfig: { skip: true }
                  },
              ],
              errorId: "isElectricityProductionError",
              mendatory: true,
          },
      ],
  },
  { //32
      id: "elecProdDetails",
      title: "PRODUCTION D'ENERGIE",
      fields: [
          {
              id: "elecProdType",
              label: "Type de production",
              type: "options",
              items: [
                  { label: 'Photovoltaïque', value: 'Photovoltaïque', icon: faCheckCircle, pdfConfig: { dx: -453, dy: - 661, pageIndex: 0 } },
                  { label: 'Eolienne', value: 'Eolienne', icon: faCheckCircle, pdfConfig: { dx: -325, dy: - 661, pageIndex: 0 } },
              ],
              mendatory: true,
              errorId: "elecProdTypeError",
              isConditional: true,
              condition: { with: "isElectricityProduction", values: ["Oui"] }
          },
          {
              id: "elecProdInstallYear",
              label: "Année d'installation du dernier équipement",
              type: "number",
              mendatory: true,
              errorId: "elecProdInstallYearError",
              isConditional: true,
              condition: { with: "isElectricityProduction", values: ["Oui"] },
              style: { marginTop: 50 },
              pdfConfig: { dx: -53, dy: - 661, pageIndex: 0 }
          }
      ],
  },
  { //31
      id: "elecProdDetails",
      title: "PRODUCTION D'ENERGIE",
      fields: [
          {
              id: "energyUsage",
              label: "Revente ou autoconsommation ?",
              type: "options",
              items: [
                  { label: 'Revente', value: 'Revente', icon: faCheckCircle, pdfConfig: { dx: -325, dy: - 680, pageIndex: 0 } },
                  { label: 'Autoconsommation', value: 'Autoconsommation', icon: faCheckCircle, pdfConfig: { dx: -259, dy: - 680, pageIndex: 0 } },
              ],
              errorId: "energyUsageError",
              mendatory: true,
              isConditional: true,
              condition: { with: "elecProdType", values: ["Photovoltaïque"] }
          },
      ],
  },
  {//33
      id: "yearlyElecCost",
      title: "PRODUCTION D'ENERGIE",
      fields: [
          {
              id: "yearlyElecCost",
              type: "textInput",
              label: "Dépense annuelle en électricité en €",
              isNumeric: true,
              errorId: "yearlyElecCostError",
              mendatory: true,
              pdfConfig: { skip: true }
              // pdfConfig: { dx: -53, dy: - 650, pageIndex: 0 }
          },
      ],
  },
  { //34
      id: "roof",
      title: "TOITURE",
      fields: [
          {
              id: "slopeOrientation",
              label: "Orientation de la toiture",
              type: "options",
              items: [
                  { label: 'Est', value: 'Est', icon: faCheckCircle, pdfConfig: { dx: -381, dy: - 757, pageIndex: 1 } },
                  { label: 'Sud-Est/Sud-Ouest', value: 'Sud-Est/Sud-Ouest', icon: faCheckCircle, pdfConfig: { dx: -303, dy: - 757, pageIndex: 1 } },
                  { label: 'Sud', value: 'Sud', icon: faCheckCircle, pdfConfig: { dx: -169, dy: - 757, pageIndex: 1 } },
                  { label: 'Ouest', value: 'Ouest', icon: faCheckCircle, pdfConfig: { dx: -119, dy: - 757, pageIndex: 1 } },
              ],
              errorId: "slopeOrientationError",
              mendatory: true,
          },
      ]
  },
  { //34
      id: "roof",
      title: "TOITURE",
      fields: [
          {
              id: "slopeSupport",
              label: "Support de la pente",
              type: "options",
              items: [
                  { label: 'Terrain', value: 'Terrain', icon: faCheckCircle, pdfConfig: { dx: -452, dy: - 776, pageIndex: 1 } },
                  { label: 'Garrage', value: 'Garrage', icon: faCheckCircle, pdfConfig: { dx: -381, dy: - 776, pageIndex: 1 } },
                  { label: 'Toitutre', value: 'Toitutre', icon: faCheckCircle, pdfConfig: { dx: -303, dy: - 776, pageIndex: 1 } },
                  { label: 'Autre', value: 'Autre', icon: faCheckCircle, pdfConfig: { dx: -225, dy: - 776, pageIndex: 1 } },
              ],
              errorId: "slopeSupportError",
              mendatory: true
          },
      ]
  },
  {
    //34
    id: 'roof',
    title: 'TOITURE',
    fields: [
      {
        id: 'roofLength',
        label: 'Longeur Utile',
        type: 'number',
        placeholder: 'Exemple: 10m',
        pdfConfig: {dx: -305, dy: -794, pageIndex: 0},
      },
      {
        id: 'roofWidth',
        label: 'Largeur Utile',
        type: 'number',
        placeholder: 'Exemple: 5m',
        style: {marginTop: 20},
        pdfConfig: {dx: -515, dy: -794, pageIndex: 0},
      },
      {
        id: 'roofTilt',
        label: 'Inclinaison',
        type: 'number',
        placeholder: 'Exemple: 10°C',
        style: {marginTop: 20},
        pdfConfig: {dx: -150, dy: -794, pageIndex: 0},
      },
    ],
    isLast: true,
  },
];
