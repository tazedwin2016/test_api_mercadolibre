const express = require('express');
const router = express.Router();
var axios = require('axios');

//Direccion de la api publica de mercadolibre
const urlApi = process.env.api_mercadolibre || 'https://api.mercadolibre.com';

// rutas
router.get('/', findItems);
router.get('/:id', findItem);
module.exports = router;


//Funcion para realizar la busqueda
async function findItems(req, res){
    //Obtener termino de busqueda
    const  q = req.query.q;

    if( !q || q.trim() === '' ) return res.status(400).json({msg:'El termino de busqueda es requerido'})

    //Consumimos la api publica de mercadolibre usando el termino que resibimos por query y limitando el resultado a 4
    const api = await axios.get(`${urlApi}/sites/MLA/search?q=${q}&limit=4`)

    const results = api.data.results;
    const available_filters = api.data.available_filters;
    const apiCategories = available_filters.find(filter => filter.id ==='category');

    let categories = [];
    //Si 
    if(apiCategories){
        const listCaterogies = apiCategories.values;
        const resultMax = Math.max(...listCaterogies.map((item) => item.results));
        const idCategory = listCaterogies.find(category=> category.results === resultMax).id
        const api = await axios.get(`${urlApi}/categories/${idCategory}`)
        const arrayCaterogries = api.data.path_from_root.map(category=> category.name);
        categories = arrayCaterogries;
    }

    const items = results.map(item=> {
        return {
            id: item.id,
            title: item.title,
            price: {
                currency: item.currency_id,
                amount: Math.trunc(item.price),
                decimals: Number((Math.trunc(item.price)-item.price).toFixed(2)*10)
            },
            picture: item.thumbnail,
            condition: item.condition,
            free_shipping: item.shipping.free_shipping,
            city: item.address.state_name
        }
    })

    //Contruimos el json que vamos a devolver 
    return res.status(200).json({
        author: {
            name: "Edwin Javier",
            lastname: "Diaz Blanco",
        },
        categories,
        items
    })
};

//Funcion para realizar la busqueda de un item por su id
async function findItem(req, res){
    const  id = req.params.id;
    if( !id || id.trim() === '' ) return res.status(400).json({msg:'El id del item es requerido'})

    //Consumimos la api publica de mercadolibre para buscar el item con el id que recibimos por el parametro de la peticion
    const apiItem = await axios.get(`${urlApi}/items/${id}`)
    //Consumimos la api publica de mercadolibre para buscar la descripcion del item
    const apiDescription = await axios.get(`${urlApi}/items/${id}/description`)
    
    //Obtenemos el item de el atributo data en la respuesta de la api
    const item = apiItem.data;
    //Obtenemos la descripcion del item en la data de la respuesta
    const description = apiDescription.data.plain_text;

    //Consumimos la api de mercado libre para buscar la categoria del iten y hacer un array con sus subcategorias
    const api = await axios.get(`${urlApi}/categories/${item.category_id}`)
    const arrayCaterogries = api.data.path_from_root.map(category=> category.name);
    const categories = arrayCaterogries;

    //Contruimos el json que vamos a devolver 
    return res.status(200).json({
        author: {
            name: "Edwin Javier",
            lastname: "Diaz Blanco",
        },
        categories,
        item: {
            id: item.id,
            title: item.title,
            price: {
                currency: item.currency_id,
                amount: Math.trunc(item.price),
                decimals: Number((Math.trunc(item.price)-item.price).toFixed(2)*10)
            },
            picture: item.thumbnail,
            condition: item.condition,
            free_shipping: item.shipping.free_shipping,
            sold_quantity: item.sold_quantity,
            description: description,
        }
    })
};
