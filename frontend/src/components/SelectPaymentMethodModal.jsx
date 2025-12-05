import React, { useEffect, useState } from "react";
import {
  PAYMENT_METHODS,
  getPaymentMethodLabel,
} from "../constants/paymentMethods";
import "../styles/SelectPaymentMethodModal.css";

export default function SelectPaymentMethodModal({
  open,
  title,
  description,
  defaultValue = "",
  amountSummary = null,
  submitting = false,
  onConfirm,
  onCancel,
}) {
  const [selectedMethod, setSelectedMethod] = useState(defaultValue || "");

  const formatAmount = (value, currency = "ARS") => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return "—";
    }
    const safeCurrency = currency || "ARS";
    try {
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: safeCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numeric);
    } catch {
      return `${safeCurrency} ${numeric.toFixed(2)}`;
    }
  };

  useEffect(() => {
    if (open) {
      setSelectedMethod(defaultValue || "");
    }
  }, [open, defaultValue]);

  if (!open) {
    return null;
  }

  const handleConfirm = () => {
    if (!selectedMethod || typeof onConfirm !== "function") return;
    onConfirm(selectedMethod);
  };

  return (
    <div className="select-payment-modal-backdrop" role="dialog" aria-modal="true">
      <div className="select-payment-modal">
        <div className="select-payment-modal-header">
          <h3>{title || "Seleccionar método de pago"}</h3>
        </div>
        {description && <p className="select-payment-modal-description">{description}</p>}
        {amountSummary && (
          <div className="select-payment-modal-summary">
            <div className="summary-row">
              <span>Precio original</span>
              <strong>
                {formatAmount(
                  amountSummary.totalOriginal,
                  amountSummary.moneda
                )}
              </strong>
            </div>
            {amountSummary.totalCobertura > 0 && (
              <div className="summary-row cobertura">
                <span>Obra social cubre</span>
                <span>
                  -
                  {formatAmount(
                    amountSummary.totalCobertura,
                    amountSummary.moneda
                  )}
                </span>
              </div>
            )}
            <div className="summary-row final">
              <span>Total a pagar</span>
              <strong>
                {formatAmount(
                  amountSummary.totalPaciente,
                  amountSummary.moneda
                )}
              </strong>
            </div>
            {amountSummary.count && amountSummary.count > 1 && (
              <small className="summary-note">
                Incluye {amountSummary.count} cuotas pendientes.
              </small>
            )}
          </div>
        )}
        <label className="select-payment-modal-label" htmlFor="select-payment-method">
          Método de pago
        </label>
        <select
          id="select-payment-method"
          className="select-payment-modal-select"
          value={selectedMethod}
          onChange={(event) => setSelectedMethod(event.target.value)}
          disabled={submitting}
        >
          <option value="" disabled>
            Seleccionar método…
          </option>
          {PAYMENT_METHODS.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
        {selectedMethod && (
          <p className="select-payment-modal-hint">
            Seleccionado: <strong>{getPaymentMethodLabel(selectedMethod)}</strong>
          </p>
        )}
        <div className="select-payment-modal-actions">
          <button
            type="button"
            className="select-payment-modal-btn secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="select-payment-modal-btn primary"
            onClick={handleConfirm}
            disabled={submitting || !selectedMethod}
          >
            {submitting ? "Registrando…" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
