import { useState } from 'react';
import { PaymentData } from '../types';

const formatCardNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  return digits;
};

export function usePaymentForm() {
  const [cardNumber, setCardNumberRaw] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiryRaw] = useState('');
  const [cvv, setCvv] = useState('');
  const [country, setCountry] = useState('Ecuador');
  const [city, setCity] = useState('Guayaquil');
  const [postalCode, setPostalCode] = useState('090101');
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const setCardNumber = (value: string) => setCardNumberRaw(formatCardNumber(value));
  const setExpiry = (value: string) => setExpiryRaw(formatExpiry(value));
  const toggleTerms = () => setAcceptedTerms((v) => !v);

  const getData = (): PaymentData => ({
    cardNumber,
    cardHolder,
    expiry,
    cvv,
    country,
    city,
    postalCode,
    acceptedTerms,
  });

  return {
    cardNumber,
    setCardNumber,
    cardHolder,
    setCardHolder,
    expiry,
    setExpiry,
    cvv,
    setCvv,
    country,
    setCountry,
    city,
    setCity,
    postalCode,
    setPostalCode,
    acceptedTerms,
    toggleTerms,
    isValid: acceptedTerms,
    getData,
  };
}
