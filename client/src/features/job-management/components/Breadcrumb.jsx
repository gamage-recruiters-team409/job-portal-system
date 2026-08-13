import { Link } from 'react-router-dom';

export default function Breadcrumb({ items }) {
  return (
    <p className="text-sm font-normal text-[#475569]">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.label}>
            {index > 0 && <span className="mx-1">&gt;</span>}
            {isLast || !item.path ? (
              <span className={isLast ? 'text-[#000000]' : ''}>{item.label}</span>
            ) : (
              <Link to={item.path} className="hover:text-[#2563EB] hover:underline">
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </p>
  );
}
