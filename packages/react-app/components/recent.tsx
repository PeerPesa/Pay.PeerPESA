import React, { useState } from 'react';

interface Transaction {
    _id: string;
    status: string;
    timestamp: string;
    currency?: string;
    receiver?: string;
    country?: string;
    operator?: string;
    amount?: string;
}

interface RecentTransactionsProps {
    recentTransactions: Transaction[];
}
const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ recentTransactions }) => {
    const [expandedTransactions, setExpandedTransactions] = useState<string[]>([]);
    const [showAll, setShowAll] = useState(false);
    const sortedTransactions = recentTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const toggleTransactionDetails = (transactionId: string) => {
        setExpandedTransactions((prevExpanded) =>
            prevExpanded.includes(transactionId)
                ? prevExpanded.filter((id) => id !== transactionId)
                : [...prevExpanded, transactionId]
        );
    };

    const handleViewAllClick = () => {
        setShowAll(!showAll);
        if (!showAll) {
            setExpandedTransactions(sortedTransactions.map(transaction => transaction._id));
        } else {
            setExpandedTransactions([]);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-sm p-2 mt-8 space-y-4 bg-white rounded-2xl shadow-3xl shadow-black/50 font-harmony ms:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
              <h2 className="mt-2 mb-3 ml-3 text-lg font-semibold text-gray-500">Recent Transactions</h2>
        {recentTransactions.length > 0 ? (
          <>
            <ul className={`grid grid-cols-1 gap-2 ${showAll ? 'h-90 overflow-y-auto' : ''}`}>
              {sortedTransactions.slice(0, showAll ? sortedTransactions.length : 2).map((transaction) => (
                <li key={transaction._id} className="p-2 m-2 transition-shadow bg-gray-100 rounded-lg shadow-sm hover:shadow-md">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleTransactionDetails(transaction._id)}>
                    <div className="text-gray-700">
                      <p className="text-base font-medium truncate">Transaction ID: {transaction._id.slice(0, 6)}***</p>
                      <p className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {transaction.status === 'COMPLETED' || transaction.status === 'NEW' ? (
                        <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2l4-4" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span
                        className={`text-sm font-semibold ${transaction.status === 'COMPLETED' || transaction.status === 'NEW' ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {transaction.status === 'COMPLETED' ? 'Completed' : transaction.status === 'NEW' ? 'Pending' : transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  {(expandedTransactions.includes(transaction._id) || showAll) && (
                    <div className="mt-2 text-gray-600">
                      <p>Id: <span className="font-medium">{transaction._id || 'N/A'}</span></p>
                      <p>Receiver: <span className="font-medium">{transaction.receiver || 'N/A'}</span></p>
                      <p>Currency: <span className="font-medium">{transaction.currency || 'N/A'}</span></p>
                      <p>Country: <span className="font-medium">{transaction.country || 'N/A'}</span></p>
                      <p>Operator: <span className="font-medium">{transaction.operator || 'N/A'}</span></p>
                      <p>Amount: <span className="font-medium">{transaction.amount ? `${transaction.currency} ${transaction.amount}` : 'N/A'}</span></p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
      
            <div className="mt-4 text-right">
              <button
                onClick={handleViewAllClick}
                className="text-sm font-medium text-blue-600 underline hover:text-blue-800"
              >
                {showAll ? 'Show Less' : 'View All'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-gray-500">No recent transactions found.</p>
            <img src="/wired-outline-19-magnifier-zoom-search-loop-spin.gif" alt="No Transactions" className="object-contain mx-auto mt-4 h-14 w-14" />

          </div>
        )}
      </div>
      
    );
};

export default RecentTransactions;
