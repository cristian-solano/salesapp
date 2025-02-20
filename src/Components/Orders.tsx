import React, { useEffect, useState } from 'react'
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../Firebase/firebase';
import '../Styles/orders.css'
import iconDelete from '../Images/icondelete.png'
import StateControl from './StateControl';
import CloseSession from './CloseSession';

interface Product {
  product: string;
  price: number;
}

interface Order {
  id: string;
  email: string;
  amount: number;
  createAt: string;
  currentState: string;
  items: Product[];
}

const Orders: React.FC = () => {

  const [sales, setSales] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState(''); 

  const getSales = async () => {
    try {
      const salesCollection = collection(db, "orders"); 
      const salesSnapshot = await getDocs(salesCollection); 
      const salesList = salesSnapshot.docs.map((doc) => {
        const data = doc.data();
        const id = doc.id
        return {
            ...data,
            createAt: data.createAt.toDate().toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }), id
          } as Order
      });
      setSales(salesList);
      setFilteredOrders(salesList);
      setLoading(false);
    } catch (error) {
      console.log("Error al obtener los productos:", error);
      setLoading(false);
    }
  };

  const updateState = async (id_order: string, newStatus: string) => {
    try {
        const orderRef = doc(db, "orders", id_order);
        await updateDoc(orderRef, { currentState: newStatus });

        alert(`actualizado el pedido ${id_order}`)
        setSales(prevOrders =>
            prevOrders.map(order =>
                order.id === id_order ? { ...order, currentState: newStatus } : order
            )
        );
    } catch (error) {
        console.log("Error al actualizar la orden:", error);
    }
  };

  const deleteOrder = async(id_order: string) => {
    try {
      const deleteOrderById = doc(db, "orders", id_order)
      await deleteDoc(deleteOrderById)
      setSales(myOrders => myOrders.filter(order => order.id !== id_order));
    } catch (error) {
      console.log("Error al eliminar la orden:", error);
    }
  }

  const handlerOnChangeState = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewStatus(e.target.value)
  }


  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearch(searchValue);
  

    if (searchValue === "") {
      setFilteredOrders(sales);
    } else {
      const filtered = sales.filter((order) =>
        order.id.toLowerCase().includes(searchValue)
      );
      setFilteredOrders(filtered);
    }
  };


  useEffect(() => {
    getSales();
  }, []);

  if (loading) {
    return <p>Cargando ordenes listas...</p>;
  }

  return (
    <div className='orders-container'>
      <div className='orders-filter'>
        <input
          type="text"
          placeholder="Escribe el Código del recibo"
          value={search}
          onChange={handleFilterChange}
        />
        </div>
      <div className='orders-content'>
        {filteredOrders.length > 0 ? filteredOrders.map((items, i) => (
          <div className='orders-info' key={items.id}>
            <h3>Recibo No. {items.id}</h3>
            <p>Fecha de pedido:{items.createAt}</p>
            <p>Cliente: {items.email}</p>
            <div className='order-info-products-content'>
              <h5>Productos</h5>
              {items.items && items.items.map((info, i) => (
                <div className='order-info-products' key={i}>
                  <p>{i+1}.</p>
                    <p>{info.product}</p>
                    <p>${info.price}</p>
                    
                </div>
              ))}
            </div>
            <h5>Estado del pedido</h5>
            <StateControl newStatus={newStatus} amount={items.amount} state={items.currentState} update={updateState} id={items.id} change={handlerOnChangeState}/>
            <h4> Total: ${items.amount}</h4>
            <div className='order-info-actions'>
              <button onClick={() => deleteOrder(items.id)}>
                <img src={iconDelete} alt="delete"/>
              </button>
            </div>
          </div>
          ))
        
          : <div>
              <p>No hay ordenes creadas</p>
            </div>}
        
      </div>
      <CloseSession/>
    </div>
  )
}

export default Orders