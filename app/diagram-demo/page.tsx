import DiagramWrapper from '../../components/react-diagrams/DiagramWrapper';

export default function DemoPage() {
  return (
    <div className="w-full max-w-5xl py-8 h-[calc(100vh-8rem)] mx-auto">
      <h1 className="text-2xl font-bold mb-4 px-4">Diagram Demo</h1>
      <div className="border rounded-lg overflow-hidden h-[calc(100%-3rem)] shadow-lg mx-4">
        <DiagramWrapper />
      </div>
    </div>
  );
}
