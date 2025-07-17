import Papa from 'papaparse';
import { useEffect, useState } from 'react';

import { Pie } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface GameData {
    Rank: number;
    Name: string;
    Platform: string;
    Year: number;
    Genre: string;
    Publisher: string;
    NA_Sales: number;
    EU_Sales: number;
    JP_Sales: number;
    Other_Sales: number;
    Global_Sales: number;
}

const ITEMS_PER_PAGE = 15;

type SortColumn = keyof GameData;
type SortDirection = 'asc' | 'desc';

const Home: React.FC = () => {
    const [data, setData] = useState<GameData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const [selectedItem, setSelectedItem] = useState<GameData>();

    useEffect(() => {
        fetch('/vgsales.csv')
            .then((response) => response.text())
            .then((csvText) => {
                Papa.parse<GameData>(csvText, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        setData(results.data);
                    },
                });
            })
    }, []);

    useEffect(() => {
        if (data.length > 0 && !selectedItem) {
            setSelectedItem(data[0]);
        }
    }, [data]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Sort data
    const sortedData = [...data];
    if (sortColumn) {
        sortedData.sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            } else {
                return sortDirection === 'asc'
                    ? String(aValue).localeCompare(String(bValue))
                    : String(bValue).localeCompare(String(aValue));
            }
        });
    }

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentPageData = sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const getSortSymbol = (column: SortColumn) => {
        if (sortColumn !== column) return '';
        return sortDirection === 'asc' ? '▲' : '▼';
    };

    let barChartData = undefined;
    if (selectedItem) {
        const sameYearGames = data.filter(
            (g) => g.Year === selectedItem.Year && g.Global_Sales != null
        );
        const sorted = [...sameYearGames].sort(
            (a, b) => b.Global_Sales - a.Global_Sales
        );
        const topGames = sorted.slice(0, 10);
        const isSelectedIncluded = topGames.some(g => g.Name === selectedItem.Name);
        if (!isSelectedIncluded) {
            topGames.push(selectedItem);
        }
        const labels = topGames.map((g) =>
            g.Name === selectedItem.Name ? `${g.Name}` : g.Name
        );
        barChartData = {
            labels,
            datasets: [
                {
                    label: 'Global Sales (millions)',
                    data: topGames.map((g) => g.Global_Sales),
                    backgroundColor: topGames.map((g) =>
                        g.Name === selectedItem.Name ? '#36A2EB' : '#8884d8'
                    ),
                },
            ],
        };
    }

    return (
        <div className="container mt-5 bg-light p-4 min-vh-100 text-dark">

            <div className='mb-4 p-3 d-flex flex-column align-items-center justify-content-center'>
                <div className='d-flex gap-4 flex-row'>
                    <div className='mx-2'>
                        <h2>Sales data for: <span className='text-info fw-bold'>{selectedItem?.Name}</span></h2>
                        <ul className="list-group mt-3 w-100">
                            <li className="list-group-item border-0"><strong>Rank:</strong> {selectedItem?.Rank}</li>
                            <li className="list-group-item border-0"><strong>Platform:</strong> {selectedItem?.Platform}</li>
                            <li className="list-group-item border-0"><strong>Year:</strong> {selectedItem?.Year}</li>
                            <li className="list-group-item border-0" ><strong>Genre:</strong> {selectedItem?.Genre}</li>
                            <li className="list-group-item border-0"><strong>Publisher:</strong> {selectedItem?.Publisher}</li>
                            <li className="list-group-item border-0"><strong>Total Global Sales:</strong> {selectedItem?.Global_Sales} million units sold</li>
                        </ul>
                    </div>

                    <div>
                        {selectedItem && (
                            <div style={{ maxWidth: '400px', margin: '0 auto' }} className='d-flex flex-column align-items-center'>
                                <h3>Regional Sales Breakdown</h3>
                                <Pie
                                    data={{
                                        labels: ['NA Sales', 'EU Sales', 'JP Sales', 'Other Sales'],
                                        datasets: [
                                            {
                                                label: 'Sales (millions)',
                                                data: [
                                                    selectedItem.NA_Sales,
                                                    selectedItem.EU_Sales,
                                                    selectedItem.JP_Sales,
                                                    selectedItem.Other_Sales
                                                ],
                                                backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
                                                borderColor: ['#fff'],
                                                borderWidth: 1
                                            }
                                        ]
                                    }}
                                    options={{
                                        plugins: {
                                            legend: {
                                                position: 'top' as const
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function (context) {
                                                        return `${context.label}: ${context.parsed} million`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                </div>
                <div>
                    {selectedItem && barChartData && (
                        <div style={{ maxWidth: '800px', marginTop: '2rem' }}>
                            <h3>Total Global Sales Comparison (Top 10 in {selectedItem.Year})</h3>
                            <Bar
                                data={barChartData}
                                options={{
                                    indexAxis: 'y',
                                    plugins: {
                                        legend: { display: false },
                                        title: {
                                            display: false,
                                            text: 'Top 10 Games vs Selected',
                                        },
                                    },
                                    scales: {
                                        x: {
                                            title: {
                                                display: true,
                                                text: 'Millions Sold',
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}
                </div>


            </div>

            <div className='shadow-lg p-4'>
                <h1 className='text-center'>All Video Game Data</h1>
                <table border={1} cellPadding={6} cellSpacing={0}>
                    <thead>
                        <tr>
                            {[
                                'Rank',
                                'Name',
                                'Platform',
                                'Year',
                                'Genre',
                                'Publisher',
                                'NA Sales (million units)',
                                'EU Sales (million units)',
                                'JP Sales (million units)',
                                'Other Sales (million units)',
                                'Total Global Sales (million units)',
                            ].map((col) => (
                                <th key={col} onClick={() => handleSort(col as SortColumn)} style={{ cursor: 'pointer' }}>
                                    {col} {getSortSymbol(col as SortColumn)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentPageData.map((game, index) => (
                            <tr key={index} onClick={() => setSelectedItem(game)}
                                style={{ backgroundColor: game === selectedItem ? '#dedcff' : 'transparent', cursor: 'pointer' }}>
                                <td>{game.Rank}</td>
                                <td>{game.Name}</td>
                                <td>{game.Platform}</td>
                                <td>{game.Year}</td>
                                <td>{game.Genre}</td>
                                <td>{game.Publisher}</td>
                                <td>{game.NA_Sales}</td>
                                <td>{game.EU_Sales}</td>
                                <td>{game.JP_Sales}</td>
                                <td>{game.Other_Sales}</td>
                                <td>{game.Global_Sales}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div style={{ marginTop: '1rem' }}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        ◀ Prev
                    </button>
                    <span style={{ margin: '0 1rem' }}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        Next ▶
                    </button>
                </div>
            </div>
        </div>

    );
};

export default Home;
