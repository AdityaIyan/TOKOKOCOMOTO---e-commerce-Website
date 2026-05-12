import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/axios';
import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const OrderDetailPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user, loading: authLoading } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('TRANSFER');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/auth/login');
            } else if (id) {
                fetchOrder();
            }
        }
    }, [id, user, authLoading]);

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/orders/${id}`);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to fetch order', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!proofFile) {
            alert('Please upload your payment proof first');
            return;
        }

        setPaying(true);
        try {
            const formData = new FormData();
            formData.append('paymentMethod', paymentMethod);
            formData.append('proof', proofFile);

            await api.post(`/orders/${id}/pay`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Payment proof submitted successfully!');
            router.push('/orders'); // Redirect to orders list
        } catch (error: any) {
            console.error('Payment failed', error);
            alert(error.response?.data?.message || 'Payment submission failed');
        } finally {
            setPaying(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProofFile(e.target.files[0]);
        }
    };

    const getImageSrc = (product: any) => {
        const images = JSON.parse(product.images || '[]');
        if (images.length > 0) {
            if (images[0].startsWith('/image/')) {
                const filename = images[0].replace('/image/', '');
                return `http://localhost:4000/public/uploads/${filename}`;
            } else if (images[0].startsWith('/') || images[0].startsWith('http')) {
                return images[0];
            } else {
                return `http://localhost:4000/public/uploads/${images[0]}`;
            }
        }
        return 'https://via.placeholder.com/150?text=No+Image';
    };

    if (loading || authLoading) return <div className="text-center py-20">Loading...</div>;
    if (!order) return <div className="text-center py-20">Order not found</div>;

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">Order #{order.id}</h1>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'PACKED' ? 'bg-indigo-100 text-indigo-800' :
                            order.status === 'VERIFYING' ? 'bg-orange-100 text-orange-800' :
                            order.status === 'UNPAID' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                            {order.status}
                        </span>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-8">
                        <h3 className="text-sm font-bold uppercase text-gray-500 mb-2">Shipping Address</h3>
                        <p className="text-gray-800">{order.shippingAddress || 'No address provided'}</p>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-sm font-bold uppercase text-gray-500 mb-4">Order Items</h3>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center border-b pb-4 last:border-0">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                            <img
                                                src={getImageSrc(item.product)}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium">{item.product.name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col border-t pt-6">
                        <div className="flex justify-between items-end w-full mb-8">
                            <div className="text-left">
                                {order.status === 'VERIFYING' && (
                                    <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded">
                                        <p className="font-bold">Payment is being verified</p>
                                        <p className="text-sm">Please wait while our admin verifies your payment proof.</p>
                                    </div>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                                <p className="text-2xl font-bold">{formatCurrency(order.totalAmount)}</p>
                            </div>
                        </div>

                        {order.status === 'UNPAID' && (
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 w-full mt-4">
                                <h3 className="text-lg font-bold uppercase tracking-widest mb-4">Payment Information</h3>
                                
                                <div className="flex space-x-4 mb-6">
                                    <button 
                                        onClick={() => setPaymentMethod('TRANSFER')}
                                        className={`px-4 py-2 font-bold text-sm rounded transition-colors ${paymentMethod === 'TRANSFER' ? 'bg-black text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
                                    >
                                        Bank Transfer
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod('QRIS')}
                                        className={`px-4 py-2 font-bold text-sm rounded transition-colors ${paymentMethod === 'QRIS' ? 'bg-black text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
                                    >
                                        QRIS
                                    </button>
                                </div>

                                <div className="bg-white p-4 rounded border mb-6">
                                    {paymentMethod === 'TRANSFER' ? (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Transfer exactly {formatCurrency(order.totalAmount)} to:</p>
                                            <p className="font-bold text-lg">Bank BCA - 1234567890</p>
                                            <p className="text-sm font-medium">a/n PT EYEWEAR INDONESIA</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center">
                                            <p className="text-sm text-gray-500 mb-4">Scan this QR code with your banking or e-wallet app:</p>
                                            <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded">
                                                {/* Placeholder for actual QR code */}
                                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=QRIS_EYEWEAR" alt="QRIS" className="w-full h-full object-contain" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-bold uppercase text-gray-700 mb-2">Upload Payment Proof</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-black file:text-white
                                            hover:file:bg-gray-800"
                                    />
                                    {proofFile && <p className="text-xs text-green-600 mt-2">File selected: {proofFile.name}</p>}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handlePayment}
                                        disabled={paying || !proofFile}
                                        className="bg-black text-white py-3 px-8 rounded font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {paying ? 'Uploading...' : 'Submit Payment'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
