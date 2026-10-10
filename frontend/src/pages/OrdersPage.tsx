// =============================================
// HARVEST BRIDGE — Orders & Logistics Lifecycle Page
// Complete state machine: Offer -> Pickup -> In-Transit -> Delivery -> Confirmed Impact
// =============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Package, CheckCircle2, Clock, MapPin,
  Calendar, DollarSign, AlertCircle, Phone, XCircle,
  FileCheck, Shield, ChevronRight
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { formatCurrency, formatWeight } from '../utils/format';
import type { Order, OrderStatus } from '../types';

export default function OrdersPage() {
  const { state, dispatch, t } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeModalOrder, setActiveModalOrder] = useState<Order | null>(null);
  const [modalMode, setModalMode] = useState<'pickup' | 'delivery' | 'cancel' | null>(null);

  // Form states for actions
  const [driverName, setDriverName] = useState('K. Venkatesh');
  const [vehicleNumber, setVehicleNumber] = useState('AP 03 TX 4412');
  const [deliveredWeight, setDeliveredWeight] = useState(0);
  const [reportedWaste, setReportedWaste] = useState(0);
  const [cancelReason, setCancelReason] = useState('Logistics delay');

  const orders = state.orders;
  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === selectedStatus);

  const handleRecordPickup = (orderId: string) => {
    dispatch({
      type: 'UPDATE_ORDER',
      payload: {
        id: orderId,
        data: {
          status: 'in_transit',
          pickupDetails: {
            driverName,
            vehicleNumber,
            collectedAt: new Date().toISOString(),
          },
        },
      },
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `notif-${Date.now()}`,
        type: 'info',
        title: '🚚 Produce Collected',
        message: `Order #${orderId} is now In Transit with vehicle ${vehicleNumber}.`,
        timestamp: new Date().toISOString(),
        read: false,
      },
    });

    setModalMode(null);
  };

  const handleConfirmDelivery = (orderId: string) => {
    const order = orders.find((o) => o._id === orderId);
    if (!order) return;

    const actualDelivered = deliveredWeight > 0 ? deliveredWeight : order.quantityKg;
    const actualWaste = Math.max(0, reportedWaste);
    const rescuedKg = Math.max(0, actualDelivered - actualWaste);

    dispatch({
      type: 'UPDATE_ORDER',
      payload: {
        id: orderId,
        data: {
          status: 'completed',
          paymentStatus: 'verified_paid',
          confirmedRescuedKg: rescuedKg,
          confirmedWasteKg: actualWaste,
          deliveryDetails: {
            deliveredAt: new Date().toISOString(),
            deliveredWeightKg: actualDelivered,
            receiverName: order.buyerName,
          },
        },
      },
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `notif-${Date.now()}`,
        type: 'success',
        title: '✅ Delivery Verified & Impact Created',
        message: `${formatWeight(rescuedKg)} successfully delivered to ${order.buyerName}. Value protected: ${formatCurrency(order.netFarmerEarnings)}.`,
        timestamp: new Date().toISOString(),
        read: false,
      },
    });

    setModalMode(null);
  };

  const handleCancel = (orderId: string) => {
    dispatch({
      type: 'UPDATE_ORDER',
      payload: {
        id: orderId,
        data: {
          status: 'cancelled',
          cancellationReason: cancelReason,
        },
      },
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `notif-${Date.now()}`,
        type: 'warning',
        title: '⚠️ Order Cancelled',
        message: `Order #${orderId} cancelled. Reserved inventory safely released.`,
        timestamp: new Date().toISOString(),
        read: false,
      },
    });

    setModalMode(null);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'scheduled_pickup':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> Scheduled Pickup</span>;
      case 'in_transit':
        return <span className="bg-sky-100 text-sky-800 border border-sky-200 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse"><Truck className="w-3 h-3" /> In Transit</span>;
      case 'delivered':
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed & Verified</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-forest-600" />
            {t('ordersTitle')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track farm-gate collection, tempo logistics, destination verification, and confirmed rescued yield
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-1.5 bg-slate-200/80 p-1 rounded-2xl">
          {['all', 'scheduled_pickup', 'in_transit', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedStatus(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                selectedStatus === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <motion.div
            key={order._id}
            whileHover={{ y: -2 }}
            className="card border border-slate-200 transition-all space-y-4"
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-forest-50 border border-forest-200 flex items-center justify-center font-bold text-forest-700 text-sm">
                  📦
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{order.cropName}</span>
                    <span className="text-xs text-slate-400 font-mono">#{order._id}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Farmer: <strong className="text-slate-700">{order.farmerName}</strong> · Buyer: <strong className="text-slate-700">{order.buyerName}</strong>
                  </div>
                </div>
              </div>
              <div>{getStatusBadge(order.status)}</div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 text-xs">
              <div>
                <div className="text-slate-500 font-medium">Quantity</div>
                <div className="text-slate-900 font-extrabold mt-0.5">{formatWeight(order.quantityKg)}</div>
              </div>
              <div>
                <div className="text-slate-500 font-medium">Agreed Price</div>
                <div className="text-slate-900 font-extrabold mt-0.5">₹{order.agreedPricePerKg}/kg</div>
              </div>
              <div>
                <div className="text-slate-500 font-medium">Net Farmer Earnings</div>
                <div className="text-forest-700 font-extrabold mt-0.5">{formatCurrency(order.netFarmerEarnings)}</div>
              </div>
              <div>
                <div className="text-slate-500 font-medium">Scheduled Date</div>
                <div className="text-slate-900 font-extrabold mt-0.5">{order.scheduledDate}</div>
              </div>
            </div>

            {/* Progress bar visual */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span className={order.status !== 'cancelled' ? 'text-forest-700' : ''}>1. Order Confirmed</span>
                <span className={order.status === 'in_transit' || order.status === 'completed' ? 'text-forest-700' : ''}>2. Farm Collection</span>
                <span className={order.status === 'completed' ? 'text-forest-700' : ''}>3. Delivered & Impact Logged</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    order.status === 'cancelled' ? 'bg-rose-500 w-full' :
                    order.status === 'completed' ? 'bg-emerald-600 w-full' :
                    order.status === 'in_transit' ? 'bg-sky-500 w-2/3' : 'bg-amber-500 w-1/3'
                  }`}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {order.farmerLocation} → {order.buyerLocation}
              </div>

              <div className="flex items-center gap-2">
                {order.status === 'scheduled_pickup' && (
                  <>
                    <button
                      onClick={() => { setActiveModalOrder(order); setModalMode('pickup'); }}
                      className="btn-primary text-xs py-2 px-4"
                    >
                      <Truck className="w-3.5 h-3.5" /> Record Pickup
                    </button>
                    <button
                      onClick={() => { setActiveModalOrder(order); setModalMode('cancel'); }}
                      className="btn-ghost text-xs py-2 text-rose-600 hover:bg-rose-50"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {order.status === 'in_transit' && (
                  <button
                    onClick={() => { setActiveModalOrder(order); setDeliveredWeight(order.quantityKg); setModalMode('delivery'); }}
                    className="btn-primary text-xs py-2 px-4 bg-emerald-700 hover:bg-emerald-800"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Delivery & Record Impact
                  </button>
                )}

                {order.status === 'completed' && (
                  <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4" /> Verified Rescued: {formatWeight(order.confirmedRescuedKg || order.quantityKg)}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="card text-center py-16 bg-white border border-slate-200">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="font-bold text-slate-700 text-lg">No orders matching this filter</div>
            <p className="text-xs text-slate-500 mt-1">Accept buyer offers to initiate scheduled collection orders.</p>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {activeModalOrder && modalMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            >
              {modalMode === 'pickup' && (
                <>
                  <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-forest-600" /> Record Farm Collection
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter vehicle and driver details for order #{activeModalOrder._id}.
                  </p>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Driver Name</label>
                      <input className="input" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Vehicle / Tempo Number</label>
                      <input className="input" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setModalMode(null)} className="btn-secondary flex-1 text-xs">Cancel</button>
                    <button onClick={() => handleRecordPickup(activeModalOrder._id)} className="btn-primary flex-1 text-xs">Confirm Pickup</button>
                  </div>
                </>
              )}

              {modalMode === 'delivery' && (
                <>
                  <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Confirm Destination Delivery
                  </h3>
                  <p className="text-xs text-slate-500">
                    Record inspected produce weights to generate verified social and ecological impact records.
                  </p>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Delivered Weight (kg)</label>
                      <input
                        type="number"
                        className="input"
                        value={deliveredWeight}
                        onChange={(e) => setDeliveredWeight(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Confirmed Spoilage / Waste (kg)</label>
                      <input
                        type="number"
                        className="input"
                        value={reportedWaste}
                        onChange={(e) => setReportedWaste(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setModalMode(null)} className="btn-secondary flex-1 text-xs">Cancel</button>
                    <button onClick={() => handleConfirmDelivery(activeModalOrder._id)} className="btn-primary flex-1 text-xs bg-emerald-700">Verify & Save Impact</button>
                  </div>
                </>
              )}

              {modalMode === 'cancel' && (
                <>
                  <h3 className="font-display font-bold text-lg text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-600" /> Cancel Order
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cancelling this order will automatically release {formatWeight(activeModalOrder.quantityKg)} back to the farmer's active inventory.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cancellation Reason</label>
                    <input className="input text-xs" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setModalMode(null)} className="btn-secondary flex-1 text-xs">Keep Order</button>
                    <button onClick={() => handleCancel(activeModalOrder._id)} className="btn-primary flex-1 text-xs bg-rose-600 hover:bg-rose-700">Confirm Cancel</button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
