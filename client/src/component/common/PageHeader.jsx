function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <section className="mb-8 space-y-4 fade-in-up">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className="section-title">{title}</h1>
      {description ? <p className="max-w-3xl text-base leading-7 text-stone-600">{description}</p> : null}
      {actions ? <div className="flex flex-wrap items-center gap-3 pt-1">{actions}</div> : null}
    </section>
  );
}

export default PageHeader;
