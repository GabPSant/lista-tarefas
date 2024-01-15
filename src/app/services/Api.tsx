'use client'

import axios from 'axios'
import {useState, useEffect} from 'react';
import Lottie from 'react-lottie';
import * as animationData from '../../../public/json/loading.json'

const api = axios.create({
    baseURL: "http://localhost:3333",
    timeout: 1000,
});

interface Tarefa{
    id: number,
    titulo: string,
}

export function Api(){
    const [loading, setLoading] = useState(false);
    const [itens, setItens] = useState<Tarefa[]>([]);

    useEffect(() =>{
        loadItems();
    }, []);

    function loadItems(){
        setLoading(true);
        setTimeout(async ()=>{
            try{
                const response = await api.get("/tarefas");
                console.log("Sucess: ", response);
                setItens(response.data);
            }
            catch(error){
                console.error("Error: ", error);
                alert("Ocorreu um erro ao tentar se conectar com o servidor");
            }
            finally{
                setLoading(false);
            }
        }, 1500)
    }

    const defaultOptions = {
        loop: true,
        autoplay: true, 
        animationData: animationData,
        rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    };

    return(
        <>
        <h1>Lista de Tarefas</h1>
        {loading && (
            <Lottie options={defaultOptions}
            height={100}
            width={100}
            />
        )}

        <ul>
            {itens.map((item)=>(
                <li key={item.id}>
                    <p>{item.titulo}</p>
                </li>
            ))}
        </ul>
        </>
    )
}