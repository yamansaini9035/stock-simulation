import { useState, useEffect } from 'react';

import { formatCurrency } from '../lib/utils';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function CompanySelector({ 
  companies, 
  selectedCompany, 
  onCompanyChange,
  currentPrice, 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState(companies);

  useEffect(() => {
    if (searchTerm) {
      const filtered = companies.filter(company => 
        company.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companies);
    }
  }, [searchTerm, companies]);

  const handleCompanySelect = (company) => {
    onCompanyChange(company);
  };

  return (
    <div className="space-y-6">
      {/* Company Search */}
      <Card className="card-professional">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Company Search
          </CardTitle>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by symbol or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </CardHeader>
      </Card>

      {/* Company List */}
      <Card className="card-professional">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Available Companies
          </CardTitle>
          <p className="text-sm text-gray-600">
            {filteredCompanies.length} companies available
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-80 overflow-y-auto">
            {filteredCompanies.map((company) => (
              <div
                key={company.symbol}
                className={`p-4 cursor-pointer transition-all duration-200 border-l-4 ${
                  selectedCompany?.symbol === company.symbol
                    ? 'bg-blue-50 border-blue-500 shadow-sm'
                    : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                }`}
                onClick={() => handleCompanySelect(company)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {company.symbol}
                      </h3>
                      {selectedCompany?.symbol === company.symbol && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate mt-1">
                      {company.name}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">
                        Vol: {company.volatility?.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        Start: {formatCurrency(company.startPrice)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(company.startPrice)}
                    </div>
                    {company.currentPrice && (
                      <div className="text-xs text-gray-600 mt-1">
                        Current: {formatCurrency(company.currentPrice)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Company Info */}
      {selectedCompany && (
        <Card className="card-professional bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {selectedCompany.symbol.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {selectedCompany.symbol}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedCompany.name}
                </p>
              </div>
            </div>
            {currentPrice && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Current Price</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(currentPrice)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
