import ContentCard from './ContentCard';

/**
 * Card for a word/phrase entry: content, translation, language_from → language_to.
 */
const WordCard = (props) => {
  const { item, ...rest } = props;
  const subtitle = [item.language_from, item.language_to].filter(Boolean).join(' → ') || null;
  const copyText = () => {
    const parts = [item.content];
    if (item.translation) parts.push(` — ${item.translation}`);
    return parts.join('');
  };
  return (
    <ContentCard
      item={item}
      primaryKey="content"
      subtitle={subtitle}
      secondary={item.translation || null}
      onCopyText={copyText}
      {...rest}
    />
  );
};

export default WordCard;
