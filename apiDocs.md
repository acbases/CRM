ajout client 

    GET all categorie 
    GET https://allapps.alphaciment.com/crm_back/api/categorieClients
    [
    {
        "id": 9,
        "intitule": "Revendeur"
    },
    {
        "id": 10,
        "intitule": "Grossiste"
    },
    

    GET all agences 
    GET https://allapps.alphaciment.com/crm_back/api/agences
    [
    {
        "id": 1,
        "intitule": "TANA",
        "region": null
    },
    {
        "id": 2,
        "intitule": "CENTRE",
        "region": null
    },

    POST https://allapps.alphaciment.com/crm_back/api/clients
    body json 
    {
        "nom": "Client Test",
        "latitude": -1.2921,
        "longitude": 36.8219,
        "zone": "CBD",
        "quartier": "Center",
        "idagence": 1,
        "idcategorie": 9
    }

ajout correspondant 
POST https://allapps.alphaciment.com/crm_back/api/correspondant
{
    "nom": "Client Test",
    "poste": "gerant",
    "contact": "032 22 222 22"
  }
    
ajout correspondant_client
POST https://allapps.alphaciment.com/crm_back/api/correspondantClient
 {
        "idcorrespondant": 1,
        "idclient": 20
    }


ajout fournisseur
POST https://allapps.alphaciment.com/crm_back/api/fournisseur
{
    "nom": "fournisseur test"
}

get all fournisseurs
GET https://allapps.alphaciment.com/crm_back/api/fournisseurS
{
    "nom": "fournisseur test"
}

ajout fournisseur_client
POST https://allapps.alphaciment.com/crm_back/api/fournisseurClient
 {
        "idfournisseur": 19,
        "idclient": 21
    }

    