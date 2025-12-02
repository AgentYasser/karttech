-- Seed database with all available Gutenberg books
-- This ensures books are visible in library immediately
-- Content will be auto-imported by the app

-- Insert all 50+ classic books from Project Gutenberg catalog
INSERT INTO public.books (
  title,
  author,
  description,
  category,
  content_type,
  gutenberg_id,
  word_count,
  estimated_reading_time,
  is_featured,
  requires_points,
  points_cost
) VALUES
-- Jane Austen
('Pride and Prejudice', 'Jane Austen', 'A romantic novel of manners set in early 19th-century England, following Elizabeth Bennet as she navigates issues of marriage, morality, and misconceptions.', 'classic', 'novel', 1342, 122000, 488, false, false, 0),
('Emma', 'Jane Austen', 'A comedy of manners about the perils of misconstrued romance, centered on Emma Woodhouse, a charming but misguided matchmaker.', 'classic', 'novel', 158, 160000, 640, false, false, 0),
('Sense and Sensibility', 'Jane Austen', 'The story of two sisters of opposing temperament but who share the pain of tragic love.', 'classic', 'novel', 161, 119000, 476, false, false, 0),

-- Charles Dickens
('Great Expectations', 'Charles Dickens', 'The story of Pip, an orphan who yearns for a greater life and unexpectedly receives a fortune from an anonymous benefactor.', 'classic', 'novel', 1400, 187000, 748, false, false, 0),
('A Tale of Two Cities', 'Charles Dickens', 'Set against the backdrop of the French Revolution, this is a story of love, sacrifice, and redemption.', 'classic', 'novel', 98, 135000, 540, false, false, 0),
('A Christmas Carol', 'Charles Dickens', 'A timeless tale of transformation as the miserly Ebenezer Scrooge is visited by three ghosts on Christmas Eve.', 'classic', 'novel', 46, 29000, 116, true, false, 0),

-- F. Scott Fitzgerald
('The Great Gatsby', 'F. Scott Fitzgerald', 'A portrait of the Jazz Age in all its decadence and excess, centered on the mysterious millionaire Jay Gatsby.', 'classic', 'novel', 64317, 47000, 188, true, false, 0),

-- William Shakespeare
('Macbeth', 'William Shakespeare', 'A Scottish general receives a prophecy that he will become king, leading to his moral descent and tyrannical rule.', 'classic', 'play', 1533, 18000, 72, false, false, 0),
('Romeo and Juliet', 'William Shakespeare', 'The tragic love story of two young star-crossed lovers whose deaths ultimately reconcile their feuding families.', 'classic', 'play', 1513, 25000, 100, true, false, 0),
('Hamlet', 'William Shakespeare', 'The Prince of Denmark seeks revenge on his uncle for murdering his father and seizing the throne.', 'classic', 'play', 1524, 30000, 120, false, false, 0),
('A Midsummer Night''s Dream', 'William Shakespeare', 'A comedy about the adventures of four young lovers and a group of amateur actors in an enchanted forest.', 'classic', 'play', 1532, 16000, 64, false, false, 0),

-- Mark Twain
('Adventures of Huckleberry Finn', 'Mark Twain', 'A boy''s adventures along the Mississippi River with an escaped slave, exploring themes of freedom and morality.', 'classic', 'novel', 76, 110000, 440, false, false, 0),
('The Adventures of Tom Sawyer', 'Mark Twain', 'The adventures of a mischievous boy growing up in a Mississippi River town.', 'classic', 'novel', 74, 71000, 284, false, false, 0),

-- George Orwell
('1984', 'George Orwell', 'A dystopian novel set in a totalitarian society under constant surveillance.', 'classic', 'novel', 5083, 89000, 356, true, false, 0),
('Animal Farm', 'George Orwell', 'A satirical allegory of Soviet totalitarianism told through the story of farm animals who rebel against their owner.', 'classic', 'novel', 1081, 30000, 120, false, false, 0),

-- Mary Shelley
('Frankenstein', 'Mary Shelley', 'The story of Victor Frankenstein and his creation, exploring themes of ambition, responsibility, and what it means to be human.', 'classic', 'novel', 84, 75000, 300, true, false, 0),

-- Oscar Wilde
('The Picture of Dorian Gray', 'Oscar Wilde', 'A young man sells his soul for eternal youth and beauty while his portrait ages and reflects his moral degradation.', 'classic', 'novel', 174, 79000, 316, false, false, 0),
('The Importance of Being Earnest', 'Oscar Wilde', 'A farcical comedy about two bachelors who create fictitious personas to escape their social obligations.', 'classic', 'play', 844, 22000, 88, false, false, 0),

-- Emily Brontë
('Wuthering Heights', 'Emily Brontë', 'A tale of passion and revenge on the Yorkshire moors, centered on the tempestuous relationship between Heathcliff and Catherine.', 'classic', 'novel', 768, 107000, 428, false, false, 0),

-- Charlotte Brontë
('Jane Eyre', 'Charlotte Brontë', 'The story of an orphan girl who becomes a governess and falls in love with her mysterious employer.', 'classic', 'novel', 1260, 184000, 736, false, false, 0),

-- Herman Melville
('Moby-Dick', 'Herman Melville', 'Captain Ahab''s obsessive quest for revenge against the white whale that destroyed his ship.', 'classic', 'novel', 2701, 206000, 824, false, false, 0),

-- Nathaniel Hawthorne
('The Scarlet Letter', 'Nathaniel Hawthorne', 'A story of sin, guilt, and redemption in Puritan Massachusetts.', 'classic', 'novel', 25344, 64000, 256, false, false, 0),

-- Leo Tolstoy
('War and Peace', 'Leo Tolstoy', 'An epic novel depicting Russian society during the Napoleonic era through the lives of five families.', 'classic', 'novel', 2600, 587000, 2348, false, false, 0),
('Anna Karenina', 'Leo Tolstoy', 'A tragic love story set against the backdrop of Russian high society.', 'classic', 'novel', 1399, 349000, 1396, false, false, 0),

-- Fyodor Dostoevsky
('Crime and Punishment', 'Fyodor Dostoevsky', 'A psychological exploration of a young man who commits murder and grapples with guilt and redemption.', 'classic', 'novel', 2554, 211000, 844, false, false, 0),
('The Brothers Karamazov', 'Fyodor Dostoevsky', 'A philosophical novel exploring faith, doubt, and morality through the story of three brothers.', 'classic', 'novel', 28054, 364000, 1456, false, false, 0),

-- Homer
('The Odyssey', 'Homer', 'The epic journey of Odysseus as he attempts to return home after the Trojan War.', 'classic', 'poem', 1727, 130000, 520, false, false, 0),
('The Iliad', 'Homer', 'An epic poem set during the Trojan War, focusing on the wrath of Achilles.', 'classic', 'poem', 6130, 155000, 620, false, false, 0),

-- Dante Alighieri
('Divine Comedy', 'Dante Alighieri', 'An epic poem describing Dante''s journey through Hell, Purgatory, and Paradise.', 'classic', 'poem', 8800, 100000, 400, false, false, 0),

-- Lewis Carroll
('Alice''s Adventures in Wonderland', 'Lewis Carroll', 'A young girl falls down a rabbit hole into a fantasy world of peculiar creatures.', 'classic', 'novel', 11, 27000, 108, true, false, 0),
('Through the Looking-Glass', 'Lewis Carroll', 'Alice''s adventures continue in a mirror-image world where everything is reversed.', 'classic', 'novel', 12, 30000, 120, false, false, 0),

-- Robert Louis Stevenson
('Treasure Island', 'Robert Louis Stevenson', 'A young boy embarks on an adventure to find buried treasure with pirates.', 'classic', 'novel', 120, 67000, 268, false, false, 0),
('Strange Case of Dr Jekyll and Mr Hyde', 'Robert Louis Stevenson', 'A London lawyer investigates strange occurrences involving his old friend and a murderous villain.', 'classic', 'novel', 43, 26000, 104, false, false, 0),

-- Bram Stoker
('Dracula', 'Bram Stoker', 'The classic vampire tale told through letters and diary entries.', 'classic', 'novel', 345, 164000, 656, false, false, 0),

-- H.G. Wells
('The Time Machine', 'H.G. Wells', 'A scientist travels to the year 802,701 AD to find humanity divided into two species.', 'classic', 'novel', 35, 33000, 132, false, false, 0),
('The War of the Worlds', 'H.G. Wells', 'Martians invade Earth in this groundbreaking science fiction novel.', 'classic', 'novel', 36, 62000, 248, false, false, 0),

-- Jules Verne
('Twenty Thousand Leagues Under the Sea', 'Jules Verne', 'An underwater adventure aboard the submarine Nautilus with the mysterious Captain Nemo.', 'classic', 'novel', 164, 111000, 444, false, false, 0),
('Around the World in Eighty Days', 'Jules Verne', 'Phileas Fogg attempts to circumnavigate the globe in 80 days to win a wager.', 'classic', 'novel', 103, 67000, 268, false, false, 0),

-- Edgar Allan Poe
('The Raven', 'Edgar Allan Poe', 'A narrative poem of a distraught lover visited by a mysterious raven.', 'classic', 'poem', 1065, 1100, 4, false, false, 0),
('The Fall of the House of Usher', 'Edgar Allan Poe', 'A gothic tale of madness, family, and the supernatural.', 'classic', 'novel', 932, 7000, 28, false, false, 0),

-- Virginia Woolf
('Mrs Dalloway', 'Virginia Woolf', 'A day in the life of Clarissa Dalloway, a high-society woman in post-WWI England.', 'classic', 'novel', 2619, 66000, 264, false, false, 0),

-- Joseph Conrad
('Heart of Darkness', 'Joseph Conrad', 'A voyage up the Congo River into the heart of Africa and human nature.', 'classic', 'novel', 219, 38000, 152, false, false, 0),

-- Jack London
('The Call of the Wild', 'Jack London', 'A domestic dog transforms into a wild animal in the Alaskan wilderness.', 'classic', 'novel', 215, 32000, 128, false, false, 0),
('White Fang', 'Jack London', 'The story of a wolf-dog''s journey from the wild to civilization.', 'classic', 'novel', 910, 72000, 288, false, false, 0),

-- Alexandre Dumas
('The Count of Monte Cristo', 'Alexandre Dumas', 'An epic tale of betrayal, imprisonment, escape, and revenge.', 'classic', 'novel', 1184, 464000, 1856, false, false, 0),
('The Three Musketeers', 'Alexandre Dumas', 'The adventures of d''Artagnan and his friends Athos, Porthos, and Aramis.', 'classic', 'novel', 1257, 257000, 1028, false, false, 0),

-- Victor Hugo
('Les Misérables', 'Victor Hugo', 'The story of ex-convict Jean Valjean and his quest for redemption in 19th-century France.', 'classic', 'novel', 135, 545000, 2180, false, false, 0),
('The Hunchback of Notre-Dame', 'Victor Hugo', 'The tragic story of Quasimodo, the hunchbacked bell-ringer of Notre-Dame Cathedral.', 'classic', 'novel', 2610, 187000, 748, false, false, 0),

-- Arthur Conan Doyle
('The Adventures of Sherlock Holmes', 'Arthur Conan Doyle', 'A collection of twelve short stories featuring the famous detective.', 'classic', 'novel', 1661, 107000, 428, false, false, 0),
('The Hound of the Baskervilles', 'Arthur Conan Doyle', 'Sherlock Holmes investigates the legend of a supernatural hound haunting the Baskerville family.', 'classic', 'novel', 2852, 60000, 240, false, false, 0),

-- Jonathan Swift
('Gulliver''s Travels', 'Jonathan Swift', 'Satirical adventures of Lemuel Gulliver through fantastical lands.', 'classic', 'novel', 829, 107000, 428, false, false, 0),

-- Daniel Defoe
('Robinson Crusoe', 'Daniel Defoe', 'A sailor is shipwrecked on a deserted island and must survive alone for years.', 'classic', 'novel', 521, 122000, 488, false, false, 0),

-- Miguel de Cervantes
('Don Quixote', 'Miguel de Cervantes', 'The adventures of an aging gentleman who becomes a knight-errant to revive chivalry.', 'classic', 'novel', 996, 430000, 1720, false, false, 0),

-- Louisa May Alcott
('Little Women', 'Louisa May Alcott', 'The lives and loves of the four March sisters growing up during the American Civil War.', 'classic', 'novel', 514, 195000, 780, false, false, 0),

-- L. Frank Baum
('The Wonderful Wizard of Oz', 'L. Frank Baum', 'Dorothy''s magical journey through the Land of Oz to find her way home.', 'classic', 'novel', 55, 42000, 168, true, false, 0),

-- Frances Hodgson Burnett
('The Secret Garden', 'Frances Hodgson Burnett', 'A young girl discovers a hidden garden that changes her life and those around her.', 'classic', 'novel', 113, 82000, 328, false, false, 0),

-- Washington Irving
('The Legend of Sleepy Hollow', 'Washington Irving', 'The tale of Ichabod Crane and his encounter with the Headless Horseman.', 'classic', 'novel', 41, 12000, 48, false, false, 0),

-- James Joyce
('Dubliners', 'James Joyce', 'A collection of fifteen short stories depicting middle-class life in Dublin.', 'classic', 'novel', 2814, 67000, 268, false, false, 0),

-- Franz Kafka
('Metamorphosis', 'Franz Kafka', 'Gregor Samsa wakes up one morning to find himself transformed into a giant insect.', 'classic', 'novel', 5200, 22000, 88, false, false, 0)

-- Prevent duplicate inserts
ON CONFLICT (title, author) DO NOTHING;

-- Note: Content will be auto-imported by the app on first run
-- The auto-import function fetches text from Project Gutenberg and creates chapters
-- Paragraph formatting is handled automatically in the reading interface

