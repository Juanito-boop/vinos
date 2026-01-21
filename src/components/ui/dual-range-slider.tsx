'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

interface DualRangeSliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
	labelPosition?: 'top' | 'bottom';
	label?: (value: number | undefined) => React.ReactNode;
}

const DualRangeSlider = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	DualRangeSliderProps
>(({ className, label, labelPosition = 'top', min = 0, max = 100, ...props }, ref) => {
	const initialValue = Array.isArray(props.value) ? props.value : [min, max];

	// Detectar si los labels se superpondrían (menos del 30% de diferencia)
	const range = (max ?? 100) - (min ?? 0);
	const isCollision = initialValue.length > 1 && (initialValue[1] - initialValue[0]) / range < 0.4;

	return (
		<SliderPrimitive.Root
			ref={ref}
			min={min}
			max={max}
			className={cn('relative flex w-full touch-none select-none items-center pt-8 pb-2', className)}
			{...props}
		>
			<SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-gray-100">
				<SliderPrimitive.Range className="absolute h-full bg-primary" />
			</SliderPrimitive.Track>
			{initialValue.map((value, index) => {
				// Si hay colisión, el segundo label va abajo
				const currentPosition = isCollision && index === 1 ? 'bottom' : labelPosition;

				return (
					<React.Fragment key={index}>
						<SliderPrimitive.Thumb className="relative block h-4 w-4 rounded-full border border-primary bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
							{label && (
								<span
									className={cn(
										'absolute flex justify-center text-xs font-black whitespace-nowrap px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm transition-opacity group-hover:opacity-100 w-max min-w-full',
										currentPosition === 'top' && '-top-9 left-1/2 -translate-x-1/2',
										currentPosition === 'bottom' && 'top-6 left-1/2 -translate-x-1/2',
									)}
								>
									{label(value)}
								</span>
							)}
						</SliderPrimitive.Thumb>
					</React.Fragment>
				);
			})}
		</SliderPrimitive.Root>
	);
});
DualRangeSlider.displayName = 'DualRangeSlider';

export { DualRangeSlider };
