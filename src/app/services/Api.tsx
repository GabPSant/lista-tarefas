'use client'

import axios from 'axios'
import {useState, useEffect} from 'react';
import { Card, CardBody, CardHeader, Input, Textarea, Button, Divider } from '@nextui-org/react';
import Lottie from 'react-lottie';
import { CgMathPlus, CgMathMinus } from 'react-icons/cg';
import {FaPencilAlt} from 'react-icons/fa'
import {GoCheck, GoX} from 'react-icons/go'
import {MdDeleteOutline} from 'react-icons/md'
import * as animationData from '../../../public/json/loading.json'

const api = axios.create({
    baseURL: "http://localhost:3333",
    timeout: 1000,
});

interface Tarefa{
    id: number,
    titulo: string,
    descricao?:string,
    isEditing: boolean,
}

const defaultOptions = {
    loop: true,
    autoplay: true, 
    animationData: animationData,
    rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

export function Api(){
    const [loading, setLoading] = useState(false);
    const [showDivAdd, setShowDivAdd] = useState(false);
    const [itens, setItens] = useState<Tarefa[]>([]);
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");

    // Serve para definir se o item é editado
    const changedItemEditing = (editing:boolean, itemId:number) => itens.map(item=>{
        // Se o elemento tiver o Id que foi mensionado,  então ele deve alterar o booleano do isEditing
        if(item.id === itemId) {
            return {...item, isEditing:editing}
        };
        return item;
    });

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

    async function handleCLickAddItem() {
        console.log(titulo);

        const data = {
            id: itens.length+1,
            titulo: titulo,
            descricao: (descricao === "")? undefined : descricao
        };

        setTitulo("");
        setDescricao("");
        loadItems();

        try {
            if (titulo === "") throw Error;
            await api.post("/tarefas", data);
        } 
        catch (error) {
            alert("Uma tarefa deve possuir um titulo");
            console.error("Error: ", error);
        }
    }

    function handleClickEditItem(itemId:number, toPut:boolean){
        console.log("Editar elemento de id: ", itemId);

        if(toPut){
            itens.map(async item=>{
                if(item.id === itemId) {
                  try{
                    if(item.titulo === '') throw Error;
                    //Permite atualizar o elemento na lista
                    await api.put(`/tarefas/${itemId}`,{titulo: item.titulo, descricao:(item.descricao === "")? undefined: item.descricao});
                  }
                  catch(error){
                    console.error("Error: ", error)
                  }
                }
            });
        }
        //Se a edição não funcionar direito avalia o booleano
        setItens(changedItemEditing(!toPut, itemId));
    }

    function handleChangeItem(itemId:number, property:string, textValue:string){
        const changedItens = itens.map(item=>{
            if(item.id === itemId) return {...item, [property]: textValue}

            return item;
        })
        setItens(changedItens);
    }

    /**
   * Essa função deleta o elemento ao lado dele e o retira da lista do servidor
   * @param itemId representa o Id do elemento que sera deletado
   */
  async function handleClickDeleteItem(itemId: number) {
    console.log("Deletar elemento de ID: ", itemId);

    try {
      const response = await api.delete(`/tarefas/${itemId}`);
      console.log(response);
      // Serve para filtrar o elemento da tela do usuário
      const filteredItens = itens.filter((item) => item.id !== itemId);
      setItens(filteredItens);
    } catch (error) {
      console.error("Error: ", error);
    }
  }

    return(
    <main className=''>
        <aside className=''>
            <Button
            onClick={()=>{setShowDivAdd(!showDivAdd)}}
            endContent={(showDivAdd)? <CgMathMinus/>: <CgMathPlus/>}
            >
                Adicionar
            </Button>

            {loading && (
            <Lottie options={defaultOptions}
            height={50}
            width={50}
            />
            )}

            {showDivAdd && 
                <div className='flex gap-4 p-2 bg-zinc-400 text-zinc-600'>
                    <div className='flex flex-col gap-3 w-2/6'>
                        <Input
                        className='w-1/2'
                        type='text'
                        label="Titulo"
                        isRequired
                        labelPlacement = "outside"
                        placeholder = "Coloque o titulo"
                        value={titulo} 
                        onValueChange={setTitulo}/>

                        <Textarea
                        type='text'
                        label="Descrição"
                        labelPlacement = "outside"
                        placeholder = "Coloque a descrição da tarefa (opcional)"
                        value={descricao}
                        onValueChange={setDescricao}
                        />
                    </div>

                    <div className='flex flex-col'>
                        <Button onClick={handleCLickAddItem} color="success">Adicionar tarefa</Button>
                    </div>
                </div>
            }
        </aside>

        <div 
        className='grid grid-cols-3 gap-4 max-w-screen-md mt-4'>
            {itens.map((item)=>(
                <Card shadow='sm' key={item.id} >
                    <CardHeader className='flex gap-2'>
                        {item.isEditing?(
                            <Textarea
                            isRequired
                            value={item.titulo}
                            onChange={(e: { target: { value: string; }; })=>{handleChangeItem(item.id, "titulo", e.target.value)}}
                            />
                        ):<p>{item.titulo}</p>}
                        <div className='flex gap-1'>
                            {item.isEditing?
                                <Button isIconOnly color="success" onClick={()=>handleClickEditItem(item.id,true)}>
                                    <GoCheck/>
                                </Button>
                                :
                                <Button isIconOnly color="secondary" onClick={()=>handleClickEditItem(item.id,false)}>
                                    <FaPencilAlt/>
                                </Button>
                            }
                            <Button isIconOnly color="danger" onClick={()=>{handleClickDeleteItem(item.id)}}>
                                <MdDeleteOutline/>
                            </Button>
                        </div>
                    </CardHeader>
                    <Divider/>
                    <CardBody className='flex w-fit h-fit'>
                        {item.isEditing?(
                            <Textarea
                            value={(item.descricao === undefined)?"":item.descricao}
                            onChange={(e: { target: { value: string; }; })=>handleChangeItem(item.id,"descricao",e.target.value)}
                            />
                        ):<p className='text-slate-500'>{(item.descricao === undefined)? "Sem descrição": item.descricao}</p>}
                    </CardBody>
                </Card>
            ))}
        </div>
    </main>
    )
}