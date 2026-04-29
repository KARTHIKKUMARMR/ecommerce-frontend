import { useParams } from 'react-router-dom';
export default function OrderConfirmPage() { 
  const { id } = useParams();
  return <div style={{padding: '100px 20px', textAlign: 'center'}}><h1>Order Confirmed: {id}</h1></div>; 
}
