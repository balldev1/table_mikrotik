'use client';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const MyComponent = () => {
  const [ethernetResults, setEthernetResults] = useState<any[]>([]);
  const [excludedResults, setExcludedResults] = useState<any[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const ab = e.target?.result as ArrayBuffer;
      const wb = XLSX.read(ab, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { header: 1 });

      // Extract Ethernet results
      const { tableData, excludedData } = extractEthernetResults(json);
      setEthernetResults(tableData);
      setExcludedResults(excludedData);
    };
    reader.readAsArrayBuffer(file);
  };

  const extractEthernetResults = (json: any[]) => {
    const startIdx = json.findIndex(row => row.includes('Ethernet test results'));
    const data = json.slice(startIdx + 1);
    const tableData: any[] = [];
    const excludedData: any[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row.length > 0) {
        const firstCell = row[0]?.toString() || '';

        // Skip rows that start with '1. A', '2. M', or '3. T'
        if (firstCell.startsWith('1. A') || firstCell.startsWith('2. M') || firstCell.startsWith('3. T')) {
          excludedData.push(row);
        } else {
          // Check if the next row exists and if it has a non-empty cell
          const nextRow = data[i + 1];
          const hasEmptyCell = nextRow?.some(cell => cell === undefined || cell === '');

          // If the next row has an empty cell, do not include the current row
          if (!hasEmptyCell) {
            tableData.push(row);
          }
        }
      }
    }

    return { tableData, excludedData };
  };

  return (
      <div>
        <input type="file" accept=".xlsx" onChange={handleFileUpload} />
        <EthernetTable data={ethernetResults} />
        <ExcludedResults data={excludedResults} />
      </div>
  );
};

const EthernetTable = ({ data }) => (
    <div className="flex pt-2">
      {data.length > 0 ? (
          <table className="bg-white w-full border-collapse border border-black">
            <thead>
            <tr className="text-black">
              <th className="border border-black"
                  rowSpan="2">Model
              </th>
              <th className="border border-black"
                  rowSpan="2">Configuration
              </th>
              <th className="border border-black" colSpan="2">
                1518 byte
              </th>
              <th className="border border-black" colSpan="2">
                512 byte
              </th>
              <th className="border border-black"
                  colSpan="2">64 byte
              </th>
            </tr>
            <tr className="text-black">
              <th className="border border-black">kpps</th>
              <th className="border border-black">10/1000</th>
              <th className="border border-black">kpps</th>
              <th className="border border-black">10GB</th>
              <th className="border border-black">2.4GHz</th>
              <th className="border border-black">5GHz</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-gray-200">
            {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="whitespace-nowrap text-gray-900 text-sm">
                  {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="p-2 text-left text-black border border-black">
                        {cell !== undefined ? cell : ''}
                      </td>
                  ))}
                </tr>
            ))}
            </tbody>
          </table>
      ) : (
          <p>No Ethernet test results available</p>
      )}
    </div>
);

const ExcludedResults = ({data}) => (
    <div className="pt-4">
      {data.length > 0 && (
          <div>
            <p>Excluded results:</p>
            <ul>
              {data.map((row, rowIndex) => (
                  <li key={rowIndex}>
                    {row.join(' | ')}
                  </li>
              ))}
            </ul>
          </div>
      )}
    </div>
);

export default MyComponent;
