import { db } from "../firebase"
import { generateId } from "./utils"



const logData = {
    "createdBy": {
        "id": "GS-US-F4TB",
        "fullName": "Salim Lyo",
        "email": "sa.lyoussi@gmail.com",
        "phone": "",
        "role": "Admin"
    },
    "createdAt": "2022-10-10T10:03:06+01:00",
    "editedBy": {
        "id": "GS-US-F4TB",
        "fullName": "Salim Lyo",
        "email": "sa.lyoussi@gmail.com",
        "phone": "",
        "role": "Admin"
    },
    "editedAt": "2022-10-10T10:03:06+01:00",
    "deleted": false
}

const products = [
    {
        "fullCategory": "PAC AIR EAU S MONO MT 4,3 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 4,3 kw YUTAKI S monophasée Taille 2 HITACHI moyenne température",
        "priceStr": "12,641.71",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU S MONO MT 6 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 2,5 kw YUTAKI S monophasée Taille 2,5 HITACHI moyenne température",
        "priceStr": "13,230.33",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S MONO MT 8 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 8kw YUTAKI S monophasée Taille 3  HITACHI  moyenne température",
        "priceStr": "13,818.96",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S MONO MT 11 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 11kw YUTAKI S monophasée Taille 4  HITACHI moyenne température",
        "priceStr": "14,997.16",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S MONO MT 14 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 14 kw YUTAKI S monophasée Taille 5  moyenne température",
        "priceStr": "16,175.36",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S MONO MT 16 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 16 kw YUTAKI S monophasée Taille 6  HITACHI moyenne température",
        "priceStr": "17,249.29",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU S MONO MT 20 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 20 kw YUTAKI S monophasée Taille 8 HITACHI moyenne température",
        "priceStr": "19,421.80",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU S MONO MT 24 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 24 kw YUTAKI S monophasée Taille 10 HITACHI Moyenne température  ",
        "priceStr": "20,843.60",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU S TRI MT 11 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 11 kw YUTAKI S triphasée Taille 4  HITACHI moyenne température",
        "priceStr": "15,945.03",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU S TRI MT 14 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 14 kw YUTAKI S triphasée Taille 5 HITACHI moyenne température",
        "priceStr": "17,123.23",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU S TRI MT 16 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 16 kw YUTAKI S triphasée Taille 6  HITACHI moyenne température",
        "priceStr": "18,197.16",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU S TRI MT 20 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 20 kw YUTAKI S triphasée Taille 8  HITACHI moyenne température",
        "priceStr": "20,369.67",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU S TRI MT 24 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 24 kw YUTAKI S triphasée Taille 10  HITACHI moyenne température",
        "priceStr": "21,971.47",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S80 MONO HT 11 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau HT 11 kw YUTAKI S80 monophasée Taille 4 HITACHI haute température",
        "priceStr": "18,059.72",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S80 MONO HT 14 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau HT 14 kw YUTAKI S80 monophasée Taille 5  HITACHI haute température",
        "priceStr": "19,237.92",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S80 MONO HT 16 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau  HT 16 kw YUTAKI S80 monophasée Taille 5  HITACHI haute température",
        "priceStr": "20,411.37",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S TRI HT 11 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau HT 11 kw YUTAKI S triphasée Taille 4  HITACHI haute température",
        "priceStr": "19,007.59",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S TRI HT 14 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau 14 kw YUTAKI S triphasée Taille 5  HITACHI haute température",
        "priceStr": "20,185.79",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S TRI HT 16 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau HT 16 kw YUTAKI S triphasée Taille 6  HITACHI haute température",
        "priceStr": "21,359.24",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU M MONO MT 4,3 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 4,3 kw YUTAKI M monophasée Taille 2 HITACHI haute température ",
        "priceStr": "12,191.47",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU M MONO MT 8 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 8 kw YUTAKI M monophasée Taille 3 HITACHI moyenne température",
        "priceStr": "13,368.72",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU M MONO MT 11 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 11 kw  YUTAKI M monophasée Taille 4 HITACHI moyenne température",
        "priceStr": "14,546.92",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU M MONO MT 14 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 14 kw YUTAKI M monophasée Taille 5 HITACHI moyenne température",
        "priceStr": "15,725.12",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU M MONO MT 16 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 16 kw YUTAKI M monophasée Taille 6 HITACHI moyenne température",
        "priceStr": "16,799.05",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU M TRI MT 11 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 11 kw YUTAKI M triphasée Taille 4 HITACHI moyenne température",
        "priceStr": "15,494.79",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU M TRI MT 14 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 14 kw YUTAKI M triphasée Taille 5 HITACHI moyenne température",
        "priceStr": "16,673.00",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU M TRI MT 16 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau MT 16 kw YUTAKI M triphasée Taille 6 HITACHI moyenne température",
        "priceStr": "17,746.92",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S COMBI MONO 11 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau 11 kw YUTAKI S COMBI monophasée Taille 4 HITACHI ",
        "priceStr": "16,347.87",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S COMBI MONO 14 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau 14 kw YUTAKI S COMBI monophaséee Taille 5 HITACHI",
        "priceStr": "17,526.07",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  SCOMBI MONO 16 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau 16 kw YUTAKI S COMBI monophasée Taille 6  HITACHI",
        "priceStr": "18,600.00",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S COMBI TRI 11 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau 11 kw YUTAKI S COMBI triphasée Taille 4  HITACHI ",
        "priceStr": "17,295.74",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S COMBI TRI 14 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau 14 kw YUTAKI S COMBI triphasée Taille 5  HITACHI ",
        "priceStr": "18,473.94",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  SCOMBI TRI 16 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau 16 kw YUTAKI S COMBI triphasée Taille 6  HITACHI ",
        "priceStr": "19,547.87",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S 80 COMBI MONO 11 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau 11 kw YUTAKI S 80 COMBI monophasée Taille 4  HITACHI ",
        "priceStr": "17,769.67",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S  80 COMBI MONO 14 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau 14 kw YUTAKI S 80 COMBI monophasée Taille 5 HITACHI",
        "priceStr": "18,947.87",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S  80 COMBI MONO 16 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau 16 kw YUTAKI S 80 COMBI monophasée Taille 6  HITACHI",
        "priceStr": "20,021.80",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S 80 COMBI TRI 11 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau 11 kw YUTAKI S 80 COMBI triphasée Taille 4  HITACHI ",
        "priceStr": "18,717.54",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S  80 COMBI TRI 14 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau 14 kw YUTAKI S 80 COMBI triphasée Taille 5  HITACHI",
        "priceStr": "19,898.74",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "PAC AIR EAU  S  80 COMBI TRI 16 kw",
        "category": "Pompe à chaleur air eau",
        "type": "produit",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air eau 16 kw YUTAKI S80 COMBI triphasée Taille 6  HITACHI",
        "priceStr": "20,969.68",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "OPTION CHAUFFE EAU ELECTRIQUE POUR PAC AIR EAU",
        "category": "Pompe à chaleur air eau",
        "type": "option",
        "name": "Option chauffe eau éléctrique pour pompe à chaleur air eau",
        "priceStr": "500.00",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "Pompe à chaleur air air MONO SPLIT",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 18/400 MONO SPLIT HITACHI AIR HOME 400 - 18 ",
        "priceStr": "1,583.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air MONO SPLIT",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 25/400 MONO SPLIT HITACHI AIR HOME 400 - 25 ",
        "priceStr": "1,792.50",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air MONO SPLIT",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 35/400 MONO SPLIT HITACHI AIR HOME 400 - 35 ",
        "priceStr": "2,083.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air MONO SPLIT",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 50/400 MONO SPLIT HITACHI AIR HOME 400 - 50",
        "priceStr": "2,993.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air MONO SPLIT",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 60/400 MONO SPLIT HITACHI AIR HOME 400 - 60 ",
        "priceStr": "3,855.00",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air MONO SPLIT",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 70/400 MONO SPLIT HITACHI AIR HOME 400 - 70",
        "priceStr": "4,885.00",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air MONO SPLIT",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 18/600 MONO SPLIT HITACHI AIR HOME 600 - 18",
        "priceStr": "1,883.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air MONO SPLIT",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 25/600 MONO SPLIT HITACHI AIR HOME 600 - 25",
        "priceStr": "2,057.50",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air MONO SPLIT",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 35/600 MONO SPLIT HITACHI AIR HOME 600 - 35",
        "priceStr": "2,510.00",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air MONO SPLIT",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 42/600 MONO SPLIT HITACHI AIR HOME 600 - 42",
        "priceStr": "3,750.00",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air MONO SPLIT",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 50/600 MONO SPLIT HITACHI AIR HOME 600 - 50",
        "priceStr": "4,068.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air MONO SPLIT",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 60/600 MONO SPLIT HITACHI AIR HOME 600 - 60",
        "priceStr": "4,278.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air MONO SPLIT",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 70/600 MONO SPLIT HITACHI AIR HOME 600 - 70",
        "priceStr": "5,893.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air CONSOLE BASSE MONO SPLIT",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "SHIROKUMA",
        "name": "Pompe à chaleur air air 25 CONSOLE BASSE MONO SPLIT HITACHI SHIROKUMA ",
        "priceStr": "4,110.83",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air CONSOLE BASSE MONO SPLIT",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "SHIROKUMA",
        "name": "Pompe à chaleur air air 35 CONSOLE BASSE MONO SPLIT HITACHI SHIROKUMA ",
        "priceStr": "4,498.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air CONSOLE BASSE MONO SPLIT",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "SHIROKUMA",
        "name": "Pompe à chaleur air air 60 CONSOLE BASSE MONO SPLIT HITACHI SHIROKUMA",
        "priceStr": "5,257.50",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air UNITE INTERIEURE",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 15 UNITE INTERIEURE HITACHI MOKAI - 15 ",
        "priceStr": "688.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air UNITE INTERIEURE",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 15 UNITE INTERIEURE HITACHI MOKAI - 18 ",
        "priceStr": "688.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air UNITE INTERIEURE",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 25 UNITE INTERIEURE HITACHI MOKAI - 25",
        "priceStr": "733.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air UNITE INTERIEURE",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 35 UNITE INTERIEURE HITACHI MOKAI - 35",
        "priceStr": "833.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air UNITE INTERIEURE",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 42 UNITE INTERIEURE HITACHI MOKAI - 42",
        "priceStr": "1,185.00",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air UNITE INTERIEURE",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 50 UNITE INTERIEURE HITACHI MOKAI - 50 ",
        "priceStr": "1,375.00",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air UNITE EXTERIEURE",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 33 UNITE EXTERIEURE BI SPLIT HITACHI  - 33",
        "priceStr": "2,397.50",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air UNITE EXTERIEURE",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 40 UNITE EXTERIEURE BI SPLIT HITACHI  - 40",
        "priceStr": "2,740.83",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air UNITE EXTERIEURE",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 53 UNITE EXTERIEURE BI SPLIT HITACHI  - 53 ",
        "priceStr": "3,092.50",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air UNITE EXTERIEURE",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 53 UNITE EXTERIEURE TRI SPLIT HITACHI  - 53",
        "priceStr": "3,805.00",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air UNITE EXTERIEURE",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 68 UNITE EXTERIEURE TRI SPLIT HITACHI  - 68",
        "priceStr": "4,433.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air UNITE EXTERIEURE",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 70 UNITE EXTERIEURE QUADRI SPLIT HITACHI  - 70 ",
        "priceStr": "5,098.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air UNITE EXTERIEURE",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 90 UNITE EXTERIEURE CINQ SPLIT HITACHI  - 90  ",
        "priceStr": "6,162.50",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Pompe à chaleur air air UNITE EXTERIEURE",
        "category": "Pompe à chaleur air air",
        "type": "product",
        "brandTemp": "HITACHI",
        "name": "Pompe à chaleur air air 110 UNITE EXTERIEURE CINQ SPLIT HITACHI  - 110 ",
        "priceStr": "6,988.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE MONO",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "EASYPELL",
        "name": "Chaudière à granulés 12 KW OKOFEN monophasée EASYPELL ",
        "priceStr": "20,699.53",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE MONO",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "EASYPELL",
        "name": "Chaudière à granulés 16 KW OKOFEN monophasée EASYPELL",
        "priceStr": "21,789.57",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE MONO",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "EASYPELL",
        "name": "Chaudière à granulés 20 KW OKOFEN monophasée  EASYPELL",
        "priceStr": "22,879.62",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE MONO",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "EASYPELL",
        "name": "Chaudière à granulés 25 KW OKOFEN monophasée EASYPELL ",
        "priceStr": "23,969.67",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE MONO",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "EASYPELL",
        "name": "Chaudière à granulés32 KW OKOFEN monophasée EASYPELL",
        "priceStr": "25,059.72",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE MONO",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "FROLING",
        "name": "Chaudière à granulés + SILO 15 KW  FROLING monophasée PECO 15 kw + SILO 300 kg ",
        "priceStr": "23,874.88",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE MONO",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "FROLING",
        "name": "Chaudière à granulés + SILO 20 KW FROLING monophasée PECO 20 kw + SILO 300 kg ",
        "priceStr": "25,012.32",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE MONO",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "FROLING",
        "name": "Chaudière à granulés + SILO 25 KW FROLING monophasée  PECO 25 kw + SILO 300 kg ",
        "priceStr": "26,149.76",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE MONO",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "FROLING",
        "name": "Chaudière à granulés + SILO 30 KW FROLING monophasée  PECO 30 kw + SILO 300 kg ",
        "priceStr": "28,424.64",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE MONO",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "FROLING",
        "name": "Chaudière à granulés + SILO 35 KW  FROLING monophasée PECO 35 kw + SILO 300 kg ",
        "priceStr": "29,562.09",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE TRI",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "EASYPELL",
        "name": "Chaudière à granulés 12 KW OKOFEN  triphasée  EASYPELL 12 kw",
        "priceStr": "21,647.40",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE TRI",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "EASYPELL",
        "name": "Chaudière à granulés 16 KW OKOFEN triphasée EASYPELL 16 kw",
        "priceStr": "22,737.44",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE TRI",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "EASYPELL",
        "name": "Chaudière à granulés 20 KW OKOFEN triphasée EASYPELL 20 kw",
        "priceStr": "23,827.49",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE TRI",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "EASYPELL",
        "name": "Chaudière à granulés 25 KW  OKOFEN triphasée EASYPELL 25 kw",
        "priceStr": "24,917.54",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE TRI",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "EASYPELL",
        "name": "Chaudière à granulés 32 KW OKOFEN triphasée EASYPELL 32 kw",
        "priceStr": "26,007.60",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE TRI",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "FROLING",
        "name": "Chaudière à granulés + SILO 15 KW FROLING triphasée PECO 15 kw + SILO 300 kg ",
        "priceStr": "24,822.75",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE TRI",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "FROLING",
        "name": "Chaudière à granulés + SILO 20 KW FROLING triphasée PECO 20 kw + SILO 300 kg ",
        "priceStr": "25,960.19",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE TRI",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "FROLING",
        "name": "Chaudière à granulés + SILO 25 KW FROLING triphasée PECO 25 kw + SILO 300 kg ",
        "priceStr": "27,097.63",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE TRI",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "FROLING",
        "name": "Chaudière à granulés + SILO 30 KW FROLING triphasée PECO 30 kw + SILO 300 kg ",
        "priceStr": "29,372.51",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "CHAUDIERE BIOMASSE INDIVIDUELLE TRI",
        "category": "Chaudières granules",
        "type": "product",
        "brandTemp": "FROLING",
        "name": "Chaudière à granulés + SILO 35 KW FROLING triphasée PECO 35 kw + SILO 300 kg ",
        "priceStr": "30,509.96",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "OPTION CHAUDIERE BIOMASSE INDIVIDUELLE",
        "category": "Chaudières granules",
        "type": "option",
        "name": "OPTION SILO 500 KG pour chaudière à granulés",
        "priceStr": "666.67",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "OPTION CHAUDIERE BIOMASSE INDIVIDUELLE",
        "category": "Chaudières granules",
        "type": "option",
        "name": "OPTION SILO textile 2,4 tonnes pour chaudière à granulés",
        "priceStr": "3,696.68",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "OPTION CHAUDIERE BIOMASSE INDIVIDUELLE",
        "category": "Chaudières granules",
        "type": "option",
        "name": "OPTION SILO textile 3,7 tonnes pour chaudière à granulés",
        "priceStr": "4,407.58",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "OPTION CHAUDIERE BIOMASSE INDIVIDUELLE",
        "category": "Chaudières granules",
        "type": "option",
        "name": "OPTION SILO textile 4,7 tonnes pour chaudière à granulés",
        "priceStr": "6,161.14",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "EAU CHAUDE SANITAIRE",
        "category": "Eau chaude sanitaire",
        "type": "product",
        "brandTemp": "Bourgeois Global",
        "name": "Chauffe eau thermodynamique 200 L Monobloc Bourgeois Global ",
        "priceStr": "3,270.14",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "EAU CHAUDE SANITAIRE",
        "category": "Eau chaude sanitaire",
        "type": "product",
        "brandTemp": "Bourgeois Global",
        "name": "Chauffe eau thermodynamique 270 L Monobloc Bourgeois Global ",
        "priceStr": "3,459.71",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "EAU CHAUDE SANITAIRE",
        "category": "Eau chaude sanitaire",
        "type": "product",
        "brandTemp": "HITACHI YUTAMPO",
        "name": "Chauffe eau thermodynamique 200 L Bi-Bloc HITACHI YUTAMPO ",
        "priceStr": "3,981.04",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "EAU CHAUDE SANITAIRE",
        "category": "Eau chaude sanitaire",
        "type": "product",
        "brandTemp": "HITACHI YUTAMPO",
        "name": "Chauffe eau thermodynamique 270 L Bi-Bloc HITACHI YUTAMPO ",
        "priceStr": "4,407.58",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "EAU CHAUDE SANITAIRE",
        "category": "Eau chaude sanitaire",
        "type": "product",
        "brandTemp": "ALLIANTZ",
        "name": "Chauffe eau solaire individuel 200 L  1 capteur (2m²) ALLIANTZ",
        "priceStr": "6,255.92",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "EAU CHAUDE SANITAIRE",
        "category": "Eau chaude sanitaire",
        "type": "product",
        "brandTemp": "ALLIANTZ",
        "name": "Chauffe eau solaire individuel 300 L ALLIANTZ 2 capteurs (4m²)",
        "priceStr": "7,573.46",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit photovoltaîques 1,5 kwc Bourgeois Global 4 modules 375 kwc + 1 onduleur 1 500 Bourgeois global ",
        "priceStr": "5,545.45",
        "taxeStr": "10.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit photovoltaîques 3 kwc Bourgeois Global 8 modules 375 kwc + 2 onduleurs 1 500 Bourgeois global ",
        "priceStr": "7,908.33",
        "taxeStr": "10.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit photovoltaîques 4,5 kwc Bourgeois Global 14 modules 375 kwc + 3 onduleurs 1 500 Bourgeois global ",
        "priceStr": "12,075.00",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit photovoltaîques 6 kwc Bourgeois Global 16 Modules 375 kwc + 4 onduleurs 1 500 Bourgeois global ",
        "priceStr": "14,575.00",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit photovoltaîques 7,5 kwc Bourgeois Global 20 modules 375 kwc + 5 onduleurs 1 500 Bourgeois global ",
        "priceStr": "17,075.00",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit photovoltaîques 9 kwc Bourgeois Global 24 modules 375 kwc + 6 onduleur 1 500 Bourgeois global ",
        "priceStr": "19,575.00",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit photovoltaîques/batterie 3 kwc Bourgeois Global 8 modules 375 kwc + 1 onduleur hybride HUAWEI Sun 2000 + 1 batterie HUAWEI LUNA 5kva + 8 optimizers SUN 2000p-450",
        "priceStr": "16,272.73",
        "taxeStr": "10.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit photovoltaîques/batterie  4,5 kwc Bourgeois Global 14 modules 375 kwc +  1 onduleur hybride HUAWEI Sun 2000 + 1 batterie HUAWEI LUNA 5kva + 10 optimizers SUN 2000p-450",
        "priceStr": "18,741.67",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit photovoltaîques/batterie  6 kwc Bourgeois Global 16 Modules 375 kwc + 1 onduleur hybride HUAWEI Sun 2000 + 1 batterie HUAWEI LUNA 5kva + 16 optimizers SUN 2000p-450 ",
        "priceStr": "21,658.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit photovoltaîques/batterie  7,5 kwc Bourgeois Global 20 modules 375 kwc + 1 onduleur hybride HUAWEI Sun 2000 + 1 batterie HUAWEI LUNA 5kva + 20 optimizers SUN 2000p-450",
        "priceStr": "24,158.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit photovoltaîques/batterie  9 kwc Bourgeois Global 24 modules 375 kwc + 1 onduleur hybride HUAWEI Sun 2000 + 1 batterie HUAWEI LUNA 5kva + 24 optimizers SUN 2000p-450",
        "priceStr": "26,825.00",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "OPTION POUR PANNEAUX PHOTOVOLTAIQUES",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Option photovoltaïques monitoring HORUS BOURGEOIS GLOBAL",
        "priceStr": "454.55",
        "taxeStr": "10.00"
    },
    {
        "fullCategory": "OPTION POUR PANNEAUX PHOTOVOLTAIQUES",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Option photovoltaïques système de stockage d'énergie inteligent Huawei 5kw ",
        "priceStr": "6,990.00",
        "taxeStr": "10.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES DUALSUN",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit photovoltaîques 1,5 kwc DUALSUN 4 modules FLASH 375 kwc + 1 onduleur AP System + monitoring visualisation consomation AP system",
        "priceStr": "6,454.55",
        "taxeStr": "10.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES DUALSUN",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit photovoltaîques 3 kwc DUALSUN 8 modules FLASH 375 kwc + 2 onduleurs AP System +  monitoring visualisation consomation AP system",
        "priceStr": "9,536.36",
        "taxeStr": "10.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES DUALSUN",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit photovoltaîques 4,5 kwc DUALSUN 12 modules FLASH 375 kwc + 3 onduleurs AP System +   monitoring visualisation consomation AP system",
        "priceStr": "12,908.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES DUALSUN",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit photovoltaîques 6 kwc DUALSUN 16 modules FLASH 375 kwc + 4 onduleurs AP System +  monitoring visualisation consomation AP system",
        "priceStr": "15,408.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES DUALSUN",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit photovoltaîques 7,5 kwc DUALSUN 20 modules FLASH 375 kwc + 5 onduleurs AP System +  monitoring visualisation consomation AP system",
        "priceStr": "17,908.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES DUALSUN",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit photovoltaîques 9 kwc DUALSUN 24 modules FLASH 375 kwc + 6 onduleurs AP System +  monitoring visualisation consomation AP system",
        "priceStr": "20,408.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES DUALSUN",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit hybrides photovoltaîques 3 kwc DUALSUN Module 375 kwc (4 modules FLASH PV + 4 MODULES SPRING HYBRIDES) +  monitoring visualisation consomation AP system",
        "priceStr": "17,263.64",
        "taxeStr": "10.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES DUALSUN",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit hybrides photovoltaïques 4,5 kwc DUALSUN Module 375 kwc (6 modules FLASH PV + 4 MODULES SPRING HYBRIDES) +  monitoring visualisation consomation AP system",
        "priceStr": "19,158.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "KIT PANNEAUX PHOTOVOLTAIQUES DUALSUN",
        "category": "KIT Panneaux photovoltaïques",
        "type": "produit",
        "name": "Kit photovoltaïques 6 kwc DUALSUN Module 375 kwc (8 modules FLASH PV + 4 MODULES SPRING HYBRIDES) +  monitoring visualisation consomation AP system",
        "priceStr": "22,483.33",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "POELE A GRANULES",
        "category": "Poêle à granulés",
        "type": "produit",
        "brandTemp": "STOVE ITALIA",
        "name": "Poêle à granulés Arianna 6 étanche sortie arrière STOVE ITALIA ",
        "priceStr": "4,640.76",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "POELE A GRANULES",
        "category": "Poêle à granulés",
        "type": "produit",
        "brandTemp": "STOVE ITALIA",
        "name": "Poêle à granulés Arianna 8 étanche sortie arrière STOVE ITALIA",
        "priceStr": "4,640.76",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "POELE A GRANULES",
        "category": "Poêle à granulés",
        "type": "produit",
        "brandTemp": "STOVE ITALIA",
        "name": "Poêle à granulés Arianna 14 étanche sortie arrière STOVE ITALIA",
        "priceStr": "5,644.55",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "POELE A GRANULES",
        "category": "Poêle à granulés",
        "type": "produit",
        "brandTemp": "STOVE ITALIA",
        "name": "Poêle à granulés  Paola 9 étanche sortie arrière STOVE ITALIA",
        "priceStr": "5,445.50",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "POELE A GRANULES",
        "category": "Poêle à granulés",
        "type": "produit",
        "brandTemp": "STOVE ITALIA",
        "name": "Poêle à granulés Paola 12 étanche sortie arrière STOVE ITALIA",
        "priceStr": "6,134.60",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "POELE A GRANULES",
        "category": "Poêle à granulés",
        "type": "produit",
        "brandTemp": "STOVE ITALIA",
        "name": "Poêle à granulés Angelina 9 étanche sortie arrière STOVE ITALIA",
        "priceStr": "5,445.50",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "POELE A GRANULES",
        "category": "Poêle à granulés",
        "type": "produit",
        "brandTemp": "STOVE ITALIA",
        "name": "Poêle à granulés Aurelia 12 étanche sortie arrière STOVE ITALIA",
        "priceStr": "6,673.93",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "POELE A GRANULES",
        "category": "Poêle à granulés",
        "type": "produit",
        "brandTemp": "STOVE ITALIA",
        "name": "Poêle à granulés Arianna 11 étanche fumisterie concentrique STOVE ITALIA",
        "priceStr": "5,559.24",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "POELE A GRANULES",
        "category": "Poêle à granulés",
        "type": "produit",
        "brandTemp": "STOVE ITALIA",
        "name": "Poêle à granulés Arianna 13 étanche fumisterie concentrique STOVE ITALIA",
        "priceStr": "5,667.30",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "POELE A GRANULES",
        "category": "Poêle à granulés",
        "type": "produit",
        "brandTemp": "STOVE ITALIA",
        "name": "Poêle à granulés Natalia 9 étanche fumisterie concentrique STOVE ITALIA",
        "priceStr": "5,229.38",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "POELE A GRANULES",
        "category": "Poêle à granulés",
        "type": "produit",
        "brandTemp": "STOVE ITALIA",
        "name": "Poêle à granulés Elisa 10 étanche fumisterie concentrique STOVE ITALIA",
        "priceStr": "5,800.95",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "POELE A BOIS",
        "category": "Poêle à bois",
        "type": "produit",
        "brandTemp": "STOVE ITALIA",
        "name": "Poêle à bois Lorena 8 STOVE ITALIA ",
        "priceStr": "6,449.29",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "POELE A BOIS",
        "category": "Poêle à bois",
        "type": "produit",
        "brandTemp": "STOVE ITALIA",
        "name": "Poêle à bois Serena 8 STOVE ITALIA",
        "priceStr": "6,904.27",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "POELE A BOIS",
        "category": "Poêle à bois ",
        "type": "produit",
        "brandTemp": "STOVE ITALIA",
        "name": "Poêle à bois Maura 7 STOVE ITALIA",
        "priceStr": "6,801.90",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "VMC ",
        "category": "VMC",
        "type": "produit",
        "brandTemp": "Domeo",
        "name": "Vmc double flux Domeo 210 FL DHU",
        "priceStr": "4,916.67",
        "taxeStr": "20.00"
    },
    {
        "fullCategory": "Borne de recharge electrique",
        "category": "Borne de recharge electrique",
        "type": "produit",
        "name": "Borne de recharge électrique",
        "priceStr": "1,791.47",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "Système solaire combiné",
        "category": "Système solaire combiné",
        "type": "produit",
        "brandTemp": "ALLIANTZ",
        "name": "Système solaire combiné 500/150 L ALLIANTZ -  5 capteurs (10m²)",
        "priceStr": "12,796.21",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "Système solaire combiné",
        "category": "Système solaire combiné",
        "type": "produit",
        "brandTemp": "ALLIANTZ",
        "name": "Système solaire combiné 750/150 L  ALLIANTZ - 5 capteurs (10m²)",
        "priceStr": "13,744.08",
        "taxeStr": "5.50"
    },
    {
        "fullCategory": "Système solaire combiné",
        "category": "Système solaire combiné",
        "type": "produit",
        "brandTemp": "ALLIANTZ",
        "name": "Système solaire combiné 900/200  ALLIANTZ -  5 capteurs (10m²)",
        "priceStr": "14,691.94",
        "taxeStr": "5.50"
    }
]

const categories = [
    { name: "POMPE A CHALEUR AIR / EAU" },
    { name: "CHAUDIERE A GRANULES" },
    { name: "EAU CHAUDE SANITAIRE" },
    { name: "PRODUITS" },
    { name: "KIT PANNEAUX SOLAIRE + FHE" },
]

export const setProducts = () => {
    try {
        //let saveProduct = true
        const batch = db.batch()

        for (const p of products) {
            // console.log(products.length)
            //if (saveProduct) {
            const id = generateId('GS-AR-')
            let tempProduct = p
            tempProduct.brand = { name: tempProduct.brandTemp }
            tempProduct = { ...tempProduct, ...logData }
            const priceStr = tempProduct.priceStr.replace(",", "")
            const taxeStr = tempProduct.taxeStr.replace(",", "")
            tempProduct.price = Number(priceStr)
            tempProduct.taxe = Number(taxeStr)
            delete tempProduct.brandTemp
            delete tempProduct.priceStr
            delete tempProduct.taxeStr
            if (!tempProduct.brandTemp)
                tempProduct.brand = ""

            const productsRef = db.collection('Products').doc(id)
            batch.set(productsRef, tempProduct)
            // }
            // saveProduct = false
        }

        batch.commit()
            .catch((e) => console.log("error batch", e))
    }
    catch (e) {
        console.log('error', e)
    }
}

export const setCategories = () => {
    try {
        for (const c of categories) {
            const id = generateId('GS-CAT-')
            db.collection('ProductCategories').doc(id).set(c, { merge: true })
        }
    }
    catch (e) {
        console.log('error', e)
    }
}