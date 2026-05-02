import { apiFetch } from './api';

export type PaymentIntentResponse = {
  payment_public_id: string;
  redirect_url?: string | null;
  gateway_reference?: string | null;
  method: string;
};

/** Creates a payment intent (auth required). `cash` / `bank_transfer` use the backend stub driver without gateway keys. */
export async function createPaymentIntent(input: {
  amount: number;
  currency?: string;
  method: string;
  return_url?: string;
  /** Morph alias e.g. `listing` */
  payable_type?: string;
  /** Numeric id for most types; for `listing` use numeric id or `public_id` UUID string. */
  payable_id?: string | number;
  /** Required with payable listing — catalog slug from GET featured-options. */
  listing_boost_package_slug?: string;
}): Promise<PaymentIntentResponse> {
  const body: Record<string, unknown> = {
    amount: input.amount,
    method: input.method,
  };
  if (input.currency) body.currency = input.currency;
  if (input.return_url) body.return_url = input.return_url;
  if (input.payable_type != null && input.payable_type !== '' && input.payable_id != null && input.payable_id !== '') {
    body.payable_type = input.payable_type;
    body.payable_id = input.payable_id;
  }
  if (input.listing_boost_package_slug) {
    body.listing_boost_package_slug = input.listing_boost_package_slug;
  }

  return apiFetch<PaymentIntentResponse>('/payments/intents', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type PaymentCompleteStubResponse = {
  message: string;
  payment_public_id: string;
  listing_boosted: boolean;
  featured_boost_days?: number;
  featured_until?: string;
};

export async function completeStubPayment(paymentPublicId: string): Promise<PaymentCompleteStubResponse> {
  return apiFetch<PaymentCompleteStubResponse>(
    `/payments/${encodeURIComponent(paymentPublicId)}/complete-stub`,
    { method: 'POST', body: '{}' },
  );
}
