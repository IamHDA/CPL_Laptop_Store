import React from "react";
import { Link } from "react-router-dom";

export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="w-full bg-[#fafafa] py-3 text-xs text-[#8e8e93]">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              {index > 0 && <span>/</span>}
              {item.href && !isLast ? (
                <Link to={item.href} className="hover:text-[#1d1d1f] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "font-medium text-[#1d1d1f]" : ""}>{item.label}</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}
