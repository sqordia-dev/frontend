import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../lib/api-client';

// Note: Install reactflow: npm install reactflow
// For now, using a placeholder implementation
// Uncomment the React Flow imports when package is installed:
// import ReactFlow, { Node, Edge, Background, Controls, MiniMap } from 'reactflow';
// import 'reactflow/dist/style.css';

interface StrategyNode {
  id: string;
  type: 'attraction' | 'conversion' | 'revenue';
  label: string;
  position: { x: number; y: number };
  data: {
    conversionRate?: number;
    monthlyValue?: number;
  };
}

interface StrategyMapCanvasProps {
  planId: string;
  onUpdate?: (nodes: StrategyNode[], monthlyRevenue: number) => void;
}

export default function StrategyMapCanvas({ planId, onUpdate }: StrategyMapCanvasProps) {
  const [nodes, setNodes] = useState<StrategyNode[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (planId) {
      loadStrategyMap();
    }
  }, [planId]);

  useEffect(() => {
    calculateMonthlyRevenue();
  }, [nodes]);

  const loadStrategyMap = async () => {
    if (!planId) return;

    setLoading(true);
    try {
      const plan = await apiClient.get(`/api/v1/business-plans/${planId}`);
      const strategyMapJson = plan.data?.strategyMapJson || plan.data?.value?.strategyMapJson;
      
      if (strategyMapJson) {
        const parsed = JSON.parse(strategyMapJson);
        setNodes(parsed.nodes || []);
        setEdges(parsed.edges || []);
      } else {
        // Initialize default nodes
        initializeDefaultNodes();
      }
    } catch (err) {
      console.error('Failed to load strategy map:', err);
      initializeDefaultNodes();
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultNodes = () => {
    const defaultNodes: StrategyNode[] = [
      {
        id: 'leads',
        type: 'attraction',
        label: 'Leads',
        position: { x: 100, y: 100 },
        data: { conversionRate: 10, monthlyValue: 100 }
      },
      {
        id: 'qualified',
        type: 'conversion',
        label: 'Qualified Leads',
        position: { x: 300, y: 100 },
        data: { conversionRate: 30, monthlyValue: 30 }
      },
      {
        id: 'customers',
        type: 'revenue',
        label: 'Customers',
        position: { x: 500, y: 100 },
        data: { conversionRate: 50, monthlyValue: 15 }
      }
    ];
    setNodes(defaultNodes);
    setEdges([
      { id: 'e1', source: 'leads', target: 'qualified' },
      { id: 'e2', source: 'qualified', target: 'customers' }
    ]);
  };

  const calculateMonthlyRevenue = () => {
    // Calculate projected monthly revenue based on node conversion rates
    let revenue = 0;
    
    nodes.forEach(node => {
      if (node.type === 'revenue' && node.data.monthlyValue) {
        revenue += node.data.monthlyValue;
      } else if (node.type === 'conversion' && node.data.conversionRate && node.data.monthlyValue) {
        // Calculate based on conversion funnel
        revenue += (node.data.monthlyValue * node.data.conversionRate) / 100;
      }
    });

    setMonthlyRevenue(revenue);
    if (onUpdate) {
      onUpdate(nodes, revenue);
    }
  };

  const handleNodeChange = async (nodeId: string, updates: Partial<StrategyNode['data']>) => {
    const updatedNodes = nodes.map(node => 
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...updates } }
        : node
    );
    setNodes(updatedNodes);

    // Save to backend
    try {
      await apiClient.post(`/api/v1/plans/${planId}/strategy-map/update`, {
        nodes: updatedNodes,
        edges
      });
    } catch (err) {
      console.error('Failed to save strategy map:', err);
    }
  };

  const getNodeColor = (type: string): string => {
    switch (type) {
      case 'attraction': return '#3B82F6'; // Blue
      case 'conversion': return '#F59E0B'; // Yellow
      case 'revenue': return '#10B981'; // Green
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading strategy map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Math HUD - Real-time Revenue Ticker */}
      <div className="p-4 rounded-lg border-2" style={{
        backgroundColor: 'rgba(255, 107, 0, 0.05)',
        borderColor: '#FF6B00'
      }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Projected Monthly Revenue</p>
            <p className="text-2xl font-bold" style={{ color: '#FF6B00' }}>
              ${monthlyRevenue.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Yearly Projection</p>
            <p className="text-xl font-semibold">
              ${(monthlyRevenue * 12).toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>

      {/* Canvas Placeholder - Replace with ReactFlow when installed */}
      <div className="relative h-96 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
        {/* Placeholder nodes */}
        <div className="absolute inset-0 p-4">
          {nodes.map(node => (
            <div
              key={node.id}
              className="absolute p-4 rounded-lg border-2 shadow-lg cursor-move"
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                backgroundColor: getNodeColor(node.type) + '20',
                borderColor: getNodeColor(node.type),
                minWidth: '120px'
              }}
            >
              <div className="text-sm font-semibold mb-2" style={{ color: getNodeColor(node.type) }}>
                {node.label}
              </div>
              {node.data.conversionRate !== undefined && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Conversion: {node.data.conversionRate}%
                </div>
              )}
              {node.data.monthlyValue !== undefined && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Value: ${node.data.monthlyValue.toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Install Notice */}
        <div className="absolute bottom-4 left-4 right-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
          <p className="text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Install <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">reactflow</code> package for full interactive canvas:
          </p>
          <code className="block mt-1 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
            npm install reactflow
          </code>
        </div>
      </div>

      {/* Node Editor Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nodes.map(node => (
          <div
            key={node.id}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <h4 className="font-semibold mb-3" style={{ color: getNodeColor(node.type) }}>
              {node.label}
            </h4>
            <div className="space-y-2">
              {node.data.conversionRate !== undefined && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                    Conversion Rate (%)
                  </label>
                  <input
                    type="number"
                    value={node.data.conversionRate}
                    onChange={(e) => handleNodeChange(node.id, { conversionRate: Number(e.target.value) })}
                    min="0"
                    max="100"
                    className="w-full px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                  />
                </div>
              )}
              {node.data.monthlyValue !== undefined && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                    Monthly Value ($)
                  </label>
                  <input
                    type="number"
                    value={node.data.monthlyValue}
                    onChange={(e) => handleNodeChange(node.id, { monthlyValue: Number(e.target.value) })}
                    min="0"
                    className="w-full px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
          <span>Attraction/Leads</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
          <span>Conversion/Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
          <span>Revenue/LTV</span>
        </div>
      </div>
    </div>
  );
}
