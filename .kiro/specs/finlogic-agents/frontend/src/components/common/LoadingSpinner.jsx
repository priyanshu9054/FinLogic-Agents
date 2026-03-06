const LoadingSpinner = ({ size = 'md', text = '' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-3">
            <div className={`${sizeClasses[size]} border-4 border-text-muted border-t-primary rounded-full animate-spin`}></div>
            {text && <p className="text-text-muted text-sm">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
