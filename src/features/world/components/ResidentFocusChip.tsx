export function ResidentFocusChip({
	residentName,
	onUnfollow,
}: {
	residentName: string;
	onUnfollow: () => void;
}) {
	return (
		<button
			className="resident-focus-chip"
			type="button"
			onClick={onUnfollow}
			aria-label={`Stop following ${residentName}`}
			title={`Stop following ${residentName}`}
		>
			<span aria-hidden="true">Following</span>
			<span className="focus-chip-name">{residentName}</span>
		</button>
	);
}
