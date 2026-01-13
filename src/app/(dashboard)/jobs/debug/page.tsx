export default function JobsDebugPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs Debug</h1>
          <p className="text-muted-foreground">
            Debug page to test if basic React rendering works
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Test Button
        </button>
      </div>
      
      <div className="border p-4 rounded">
        <h2 className="text-xl mb-4">Debug Information</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>This is a simple page with no complex dependencies</li>
          <li>If you can see this formatted content, React is working</li>
          <li>If you only see plain text, there's a rendering issue</li>
        </ul>
      </div>
    </div>
  )
}