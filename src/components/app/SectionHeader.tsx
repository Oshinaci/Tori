import { Link, type LinkProps } from "@tanstack/react-router";

export function SectionHeader({
  title,
  linkTo,
  linkLabel = "See all",
}: {
  title: string;
  linkTo?: LinkProps["to"];
  linkLabel?: string;
}) {
  return (
    <div className="mt-8 flex items-end justify-between">
      <h2 className="text-base font-semibold">{title}</h2>
      {linkTo && (
        <Link to={linkTo} className="text-xs font-medium text-sky-400 hover:text-sky-300">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
