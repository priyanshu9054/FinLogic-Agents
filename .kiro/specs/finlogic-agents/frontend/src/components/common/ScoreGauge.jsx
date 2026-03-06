import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const ScoreGauge = ({ score, maxScore = 900 }) => {
    const percentage = (score / maxScore) * 100;

    const getColor = () => {
        if (score >= 750) return '#22C55E';
        if (score >= 600) return '#F59E0B';
        if (score >= 400) return '#F97316';
        return '#EF4444';
    };

    const data = [
        { value: score },
        { value: maxScore - score },
    ];

    return (
        <div className="relative w-64 h-64 mx-auto">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={80}
                        outerRadius={110}
                        dataKey="value"
                        stroke="none"
                    >
                        <Cell fill={getColor()} />
                        <Cell fill="#1A2332" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold font-heading" style={{ color: getColor() }}>
                    {score}
                </div>
                <div className="text-text-muted text-sm mt-1">out of {maxScore}</div>
            </div>
        </div>
    );
};

export default ScoreGauge;
