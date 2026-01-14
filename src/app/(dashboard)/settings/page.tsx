export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <p>Manage your profile, business settings, and account preferences</p>
      
      <div className="mt-8 space-y-4">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Profile Settings</h2>
          <p className="text-gray-600 mb-3">Manage your personal information, email, and password</p>
          <a 
            href="/settings/profile"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Configure Profile
          </a>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Business Settings</h2>
          <p className="text-gray-600 mb-3">Configure your business information, tax rates, and invoice defaults</p>
          <a 
            href="/settings/business"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Configure Business
          </a>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Billing & Subscription</h2>
          <p className="text-gray-600 mb-3">Manage your subscription, billing information, and payment methods</p>
          <a 
            href="/settings/billing"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View Billing
          </a>
        </div>
      </div>
    </div>
  )
}