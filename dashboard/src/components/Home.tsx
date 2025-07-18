import Papa from 'papaparse';
import { useEffect, useState, useRef } from 'react';

import { Pie } from 'react-chartjs-2';
import { Bar, getElementAtEvent } from 'react-chartjs-2';
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
    const chartRef = useRef<ChartJS<'bar'>>(null);

    //bar chart items
    const [comparisonYear, setComparisonYear] = useState<number | null>(null);
    const [topCount, setTopCount] = useState<number>(10);
    const [salesMetric, setSalesMetric] = useState<keyof Pick<GameData, 'Global_Sales' | 'NA_Sales' | 'EU_Sales' | 'JP_Sales' | 'Other_Sales'>>('Global_Sales');


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
            setComparisonYear(data[0].Year);
        }
    }, [data, selectedItem]);

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

    //Bar Chart Data 
    let barChartData = undefined;
    if (selectedItem) {
        const year = comparisonYear ?? selectedItem.Year;

        const sameYearGames = data.filter(
            (g) => g.Year === year && g[salesMetric] != null
        );

        const sorted = [...sameYearGames].sort(
            (a, b) => b[salesMetric] - a[salesMetric]
        );

        const topGames = sorted.slice(0, topCount);
        const isSelectedIncluded = topGames.some(g => g.Name === selectedItem.Name);
        if (!isSelectedIncluded) topGames.push(selectedItem);

        const labels = topGames.map((g) =>
            g.Name === selectedItem.Name ? `${g.Name}` : g.Name
        );

        barChartData = {
            labels,
            datasets: [
                {
                    label: `${salesMetric.replace('_', ' ')} (millions)`,
                    data: topGames.map((g) => g[salesMetric]),
                    backgroundColor: topGames.map((g) =>
                        g.Name === selectedItem.Name ? '#FAED26' : '#8884d8'
                    ),
                },
            ],
        };
    }

    return (
        <div className="container bg-dark p-4 min-vh-100 text-light">

            <div className='mb-4 p-3 d-flex flex-column align-items-center justify-content-center'>
                <div className='d-flex gap-4 flex-row'>
                    <div className='mx-2  p-3 rounded-3'>
                        <h2>Sales data for: <span className='text-primary fw-bold'>{selectedItem?.Name}</span></h2>
                        <ul className="list-group mt-3 w-100 ">
                            <li className="list-group-item border-0 bg-secondary text-light"><strong>Rank:</strong> {selectedItem?.Rank}</li>
                            <li className="list-group-item border-0 bg-info text-light"><strong>Platform:</strong> {selectedItem?.Platform}</li>
                            <li className="list-group-item border-0 bg-secondary text-light"><strong>Year:</strong> {selectedItem?.Year}</li>
                            <li className="list-group-item border-0 bg-info text-light" ><strong>Genre:</strong> {selectedItem?.Genre}</li>
                            <li className="list-group-item border-0 bg-secondary text-light"><strong>Publisher:</strong> {selectedItem?.Publisher}</li>
                            <li className="list-group-item border-0 bg-info text-light"><strong>Total Global Sales:</strong> {selectedItem?.Global_Sales} million units sold</li>
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
                                                borderWidth: 0
                                            }
                                        ]
                                    }}
                                    options={{
                                        plugins: {
                                            legend: {
                                                position: 'top' as const,
                                                labels: {
                                                    color: '#fff'
                                                }
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
                <div className='d-flex gap-3 align-items-center'>
                   
                    {selectedItem && barChartData && (
                        <div style={{ maxWidth: '800px', marginTop: '2rem' }} >
                            <h3>Total {salesMetric.replaceAll('_', ' ')} Comparison (Against Top {topCount} in {comparisonYear})</h3>
                            <Bar
                                ref={chartRef}
                                data={barChartData}
                                options={{
                                    indexAxis: 'y',
                                    plugins: {
                                        legend: {
                                            display: false,
                                            labels: {
                                                color: '#fff'
                                            }
                                        },
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
                                                color: '#fff'
                                            },
                                            ticks: {
                                                color: '#fff'
                                            }
                                        },
                                        y: {
                                            ticks: {
                                                color: (ctx) => {
                                                    const label = ctx.tick.label;
                                                    return label === selectedItem?.Name ? '#FAED26' : '#fff';
                                                }
                                            }
                                        }
                                    },
                                }}
                                onClick={(event) => {
                                    if (!chartRef.current) return;
                                    const elements = getElementAtEvent(chartRef.current, event);
                                    if (elements && elements.length > 0) {
                                        const index = elements[0].index;
                                        const year = comparisonYear ?? selectedItem.Year;
                                        const sameYearGames = data.filter(
                                            (g) => g.Year === year && g[salesMetric] != null
                                        );
                                        const sorted = [...sameYearGames].sort(
                                            (a, b) => b[salesMetric] - a[salesMetric]
                                        );
                                        const topGames = sorted.slice(0, topCount);
                                        const isSelectedIncluded = topGames.some(g => g.Name === selectedItem.Name);
                                        if (!isSelectedIncluded) topGames.push(selectedItem);
                                        const clickedGame = topGames[index];
                                        if (clickedGame) setSelectedItem(clickedGame);
                                    }
                                }}
                            />
                        </div>
                    )}

                     {selectedItem && (
                        <div className="my-3 p-3 bg-secondary text-light rounded align-items-center">
                            <h4>Customize Bar Chart</h4>
                            <div className="d-flex flex-wrap gap-4 align-items-center">
                                <div>
                                    <label>Year: </label>
                                    <select
                                        className="form-select"
                                        style={{ width: '120px' }}
                                        value={comparisonYear ?? selectedItem.Year}
                                        onChange={(e) => setComparisonYear(parseInt(e.target.value))}
                                    >
                                        {[...new Set(data.map(d => d.Year))]
                                            .sort((a, b) => a - b)
                                            .map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Top N Games: </label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        min={5}
                                        max={25}
                                        style={{ width: '100px' }}
                                        value={topCount}
                                        onChange={(e) => setTopCount(parseInt(e.target.value))}
                                    />
                                </div>

                                <div>
                                    <label>Sales Metric: </label>
                                    <select
                                        className="form-select"
                                        style={{ width: '160px' }}
                                        value={salesMetric}
                                        onChange={(e) => setSalesMetric(e.target.value as any)}
                                    >
                                        <option value="Global_Sales">Global Sales</option>
                                        <option value="NA_Sales">NA Sales</option>
                                        <option value="EU_Sales">EU Sales</option>
                                        <option value="JP_Sales">JP Sales</option>
                                        <option value="Other_Sales">Other Sales</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>


            </div>

            <div className='shadow-lg p-4'>
                <h1 className='text-center'>All Video Game Data</h1>
                <table border={1} cellPadding={12} cellSpacing={0}>
                    <thead >
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
                                style={{ backgroundColor: game === selectedItem ? '#FAED26' : 'transparent', cursor: 'pointer', color: game === selectedItem ? 'black' : 'white' }}>
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
                <div style={{ marginTop: '1rem' }} className='d-flex justify-content-center align-items-center'>
                    <button className="btn text-light bg-info" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        Prev
                    </button>
                    <span style={{ margin: '0 1rem' }}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button className="btn text-light bg-info" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        Next
                    </button>
                </div>
            </div>
        </div>

    );
};

export default Home;
