import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Loader = ({ fullScreen = false, size = 'md', className, text = '' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    };

    const loaderElement = (
        <div className={twMerge(clsx('flex flex-col items-center justify-center text-primary-600', className))}>
            <Loader2 className={clsx('animate-spin', sizeClasses[size])} />
            {text && <p className="mt-3 text-sm font-medium text-gray-600 animate-pulse">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                {loaderElement}
            </div>
        );
    }

    return loaderElement;
};

export default Loader;