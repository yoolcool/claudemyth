interface MainViewProps {
  content: string;
}

export function MainView({ content }: MainViewProps) {
  return (
    <div className="main-view">
      {content ? (
        <pre className="myth-text">{content}</pre>
      ) : (
        <div className="placeholder">
          <p>◈ MYTH ENGINE ◈</p>
          <p>seed를 입력하고 Generate를 눌러 신화를 생성하세요.</p>
          <p>또는 Random 버튼으로 무작위 세계를 탐험하세요.</p>
        </div>
      )}
    </div>
  );
}
