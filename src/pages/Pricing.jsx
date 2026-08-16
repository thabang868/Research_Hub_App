import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const PLANS = [
  {
    id: 'free_trial',
    name: 'Free Trial',
    badge: 'Starter',
    price: 'R0',
    period: '24 hours',
    color: 'emerald',
    features: [
      'Full features for 24 hours',
      '1 device',
      'No credit card required',
      'Auto-expires after 24 hours',
    ],
    cta: null,
  },
  {
    id: 'daily',
    name: 'Daily Plan',
    badge: null,
    price: 'R10',
    period: '/ day',
    color: 'blue',
    features: [
      'Full system features',
      'Up to 2 devices',
      'Cancel anytime',
      'Best for short-term users',
    ],
    cta: 'Get Daily Access',
  },
  {
    id: 'monthly',
    name: 'Monthly Plan',
    badge: 'Recommended',
    price: 'R50',
    period: '/ month',
    color: 'violet',
    popular: true,
    features: [
      'Full system features',
      'Up to 2 devices',
      'Priority support',
      'Best for regular users',
    ],
    cta: 'Subscribe Monthly',
  },
  {
    id: 'unlimited',
    name: 'Unlimited Plan',
    badge: 'Premium',
    price: 'R300',
    period: 'once-off',
    color: 'amber',
    features: [
      'Unlimited usage forever',
      'Up to 2 devices',
      'All premium features',
      'Best for power users',
    ],
    cta: 'Go Unlimited',
  },
];

const COLORS = {
  emerald: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25',
    ring: 'border-emerald-200',
    check: 'text-emerald-500',
  },
  blue: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: 'bg-blue-50 text-blue-600 border-blue-100',
    btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25',
    ring: 'border-blue-200',
    check: 'text-blue-500',
  },
  violet: {
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
    icon: 'bg-violet-50 text-violet-600 border-violet-100',
    btn: 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/25',
    ring: 'border-violet-300 shadow-violet-100/50',
    check: 'text-violet-500',
  },
  amber: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: 'bg-amber-50 text-amber-600 border-amber-100',
    btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25',
    ring: 'border-amber-200',
    check: 'text-amber-500',
  },
};

async function readApiResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  const text = await response.text();
  return { error: response.status === 404
    ? 'Payment endpoint not found. Restart the backend server and try again.'
    : text || `Payment service returned HTTP ${response.status}` };
}

export default function Pricing() {
  const { user, subscription, setSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Paystack returns a reference. The backend verifies it directly with
  // Paystack before activating access (webhooks remain a secondary path).
  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference || !user) return;
    const verify = async () => {
      setSuccess('Verifying your Paystack payment...');
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`/api/billing/paystack/verify/${encodeURIComponent(reference)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await readApiResponse(res);
        if (!res.ok) throw new Error(data.error || 'Payment verification failed');
        setSubscription(data.subscription);
        setSuccess('Subscription activated successfully!');
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (err) {
        setSuccess('');
        setError(err.message);
      } finally {
        setSearchParams({});
      }
    };
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubscribe = async (planId) => {
    if (!user) {
      navigate('/signup');
      return;
    }

    setLoading(planId);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/billing/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await readApiResponse(res);
      if (!res.ok) throw new Error(data.error || 'Failed to start payment');

      // Redirect to Paystack's hosted checkout; no secret enters the browser.
      window.location.assign(data.redirectUrl);
    } catch (err) {
      setError(err.message);
      setLoading(null);
    }
  };

  const currentPlan = subscription?.plan;

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar current="Pricing" />}

      {/* Header */}
      {!user && (
        <nav className="w-full px-4 sm:px-10 lg:px-20 py-4 sm:py-5 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-900 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xs sm:text-sm">R</span>
            </div>
            <span className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">RHub</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/signin')} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-all cursor-pointer">Sign In</button>
            <button onClick={() => navigate('/signup')} className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-lg shadow-gray-900/25 hover:bg-gray-800 transition-all cursor-pointer">Get Started</button>
          </div>
        </nav>
      )}

      <main className="px-4 sm:px-10 lg:px-20 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="text-center mb-10 sm:mb-14">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Choose Your Plan</h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
              Start with a free 24-hour trial. Upgrade anytime to keep full access to papers, datasets, AI tools, and more.
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="max-w-md mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center">{error}</div>
          )}
          {success && (
            <div className="max-w-md mx-auto mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 text-center">{success}</div>
          )}

          {/* Current plan indicator */}
          {currentPlan && (
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 shadow-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Current plan: <strong className="text-gray-900">{PLANS.find((p) => p.id === currentPlan)?.name || currentPlan}</strong>
                {subscription?.expires_at && (
                  <span className="text-gray-400">
                    &middot; Expires {new Date(subscription.expires_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Plan Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {PLANS.map((plan) => {
              const c = COLORS[plan.color];
              const isCurrent = currentPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl border ${plan.popular ? c.ring + ' shadow-lg' : 'border-gray-200 shadow-sm'} p-6 flex flex-col transition-all hover:shadow-xl hover:-translate-y-1`}
                >
                  {/* Popular ribbon */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={`px-3 py-1 ${c.badge} text-[10px] font-bold uppercase tracking-wide rounded-full border`}>
                        Recommended
                      </span>
                    </div>
                  )}

                  {/* Badge */}
                  {plan.badge && !plan.popular && (
                    <span className={`inline-flex self-start px-2.5 py-0.5 ${c.badge} text-[10px] font-bold uppercase rounded-full border mb-3`}>
                      {plan.badge}
                    </span>
                  )}

                  {plan.popular && <div className="h-3"></div>}

                  {/* Plan name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.name}</h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-sm text-gray-400">{plan.period}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${c.check}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {plan.cta ? (
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isCurrent || loading === plan.id}
                      className={`w-full py-3 text-sm font-medium text-white rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${c.btn}`}
                    >
                      {loading === plan.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Processing...
                        </span>
                      ) : isCurrent ? (
                        'Current Plan'
                      ) : (
                        plan.cta
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-3 text-sm font-medium text-center text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                      {isCurrent ? 'Active Trial' : 'Included on Signup'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 mt-8">
            All prices in South African Rand (ZAR). Plans activate immediately upon subscription.
          </p>
        </div>
      </main>
    </div>
  );
}
