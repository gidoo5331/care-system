import { HeartIcon } from 'lucide-react'
import { APP_NAME } from '~/lib/constants'
import { cn } from '~/lib/utils'

interface Props {
	size?: 'default' | 'lg'
	withName?: boolean
	className?: string
}

export function BrandMark({ size = 'default', withName, className }: Props) {
	return (
		<span className={cn('flex items-center gap-3', className)}>
			<span
				aria-hidden="true"
				className={cn(
					'bg-primary text-primary-foreground flex items-center justify-center rounded-xl',
					size === 'lg' ? 'size-12' : 'size-10',
				)}
			>
				<HeartIcon
					className={size === 'lg' ? 'size-[26px]' : 'size-[22px]'}
					strokeWidth={2}
				/>
			</span>
			{withName ? (
				<span className="text-lg leading-6 font-semibold">{APP_NAME}</span>
			) : null}
		</span>
	)
}
