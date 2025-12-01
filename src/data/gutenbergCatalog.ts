// List of 50+ classic books from Project Gutenberg
// All books are public domain and free to use

export interface GutenbergBook {
    gutenberg_id: number;
    title: string;
    author: string;
    category: 'classic';
    contentType: 'novel' | 'play' | 'poem' | 'essay';
    description: string;
    estimatedWordCount: number;
    genre?: string;
    yearPublished?: number;
}

export const GUTENBERG_BOOKS: GutenbergBook[] = [
    // Jane Austen
    {
        gutenberg_id: 1342,
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        category: 'classic',
        contentType: 'novel',
        description: 'A romantic novel of manners set in early 19th-century England, following Elizabeth Bennet as she navigates issues of marriage, morality, and misconceptions.',
        estimatedWordCount: 122000,
        genre: 'Romance',
        yearPublished: 1813
    },
    {
        gutenberg_id: 158,
        title: 'Emma',
        author: 'Jane Austen',
        category: 'classic',
        contentType: 'novel',
        description: 'A comedy of manners about the perils of misconstrued romance, centered on Emma Woodhouse, a charming but misguided matchmaker.',
        estimatedWordCount: 160000,
        genre: 'Romance',
        yearPublished: 1815
    },
    {
        gutenberg_id: 161,
        title: 'Sense and Sensibility',
        author: 'Jane Austen',
        category: 'classic',
        contentType: 'novel',
        description: 'The story of two sisters of opposing temperament but who share the pain of tragic love.',
        estimatedWordCount: 119000,
        genre: 'Romance',
        yearPublished: 1811
    },

    // Charles Dickens
    {
        gutenberg_id: 1400,
        title: 'Great Expectations',
        author: 'Charles Dickens',
        category: 'classic',
        contentType: 'novel',
        description: 'The story of Pip, an orphan who yearns for a greater life and unexpectedly receives a fortune from an anonymous benefactor.',
        estimatedWordCount: 187000,
        genre: 'Coming-of-age',
        yearPublished: 1861
    },
    {
        gutenberg_id: 98,
        title: 'A Tale of Two Cities',
        author: 'Charles Dickens',
        category: 'classic',
        contentType: 'novel',
        description: 'Set against the backdrop of the French Revolution, this is a story of love, sacrifice, and redemption.',
        estimatedWordCount: 135000,
        genre: 'Historical Fiction',
        yearPublished: 1859
    },
    {
        gutenberg_id: 46,
        title: 'A Christmas Carol',
        author: 'Charles Dickens',
        category: 'classic',
        contentType: 'novel',
        description: 'A timeless tale of transformation as the miserly Ebenezer Scrooge is visited by three ghosts on Christmas Eve.',
        estimatedWordCount: 29000,
        genre: 'Fantasy',
        yearPublished: 1843
    },

    // F. Scott Fitzgerald
    {
        gutenberg_id: 64317,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        category: 'classic',
        contentType: 'novel',
        description: 'A portrait of the Jazz Age in all its decadence and excess, centered on the mysterious millionaire Jay Gatsby.',
        estimatedWordCount: 47000,
        genre: 'Literary Fiction',
        yearPublished: 1925
    },

    // William Shakespeare
    {
        gutenberg_id: 1533,
        title: 'Macbeth',
        author: 'William Shakespeare',
        category: 'classic',
        contentType: 'play',
        description: 'A Scottish general receives a prophecy that he will become king, leading to his moral descent and tyrannical rule.',
        estimatedWordCount: 18000,
        genre: 'Tragedy',
        yearPublished: 1606
    },
    {
        gutenberg_id: 1513,
        title: 'Romeo and Juliet',
        author: 'William Shakespeare',
        category: 'classic',
        contentType: 'play',
        description: 'The tragic love story of two young star-crossed lovers whose deaths ultimately reconcile their feuding families.',
        estimatedWordCount: 25000,
        genre: 'Tragedy',
        yearPublished: 1597
    },
    {
        gutenberg_id: 1524,
        title: 'Hamlet',
        author: 'William Shakespeare',
        category: 'classic',
        contentType: 'play',
        description: 'The Prince of Denmark seeks revenge on his uncle for murdering his father and seizing the throne.',
        estimatedWordCount: 30000,
        genre: 'Tragedy',
        yearPublished: 1603
    },
    {
        gutenberg_id: 1532,
        title: 'A Midsummer Night\'s Dream',
        author: 'William Shakespeare',
        category: 'classic',
        contentType: 'play',
        description: 'A comedy about the adventures of four young lovers and a group of amateur actors in an enchanted forest.',
        estimatedWordCount: 16000,
        genre: 'Comedy',
        yearPublished: 1600
    },

    // Mark Twain
    {
        gutenberg_id: 76,
        title: 'Adventures of Huckleberry Finn',
        author: 'Mark Twain',
        category: 'classic',
        contentType: 'novel',
        description: 'Huck Finn escapes his abusive father and embarks on a journey down the Mississippi River with an escaped slave.',
        estimatedWordCount: 112000,
        genre: 'Adventure',
        yearPublished: 1884
    },
    {
        gutenberg_id: 74,
        title: 'The Adventures of Tom Sawyer',
        author: 'Mark Twain',
        category: 'classic',
        contentType: 'novel',
        description: 'The mischievous Tom Sawyer has adventures in a small town along the Mississippi River.',
        estimatedWordCount: 71000,
        genre: 'Adventure',
        yearPublished: 1876
    },

    // Oscar Wilde
    {
        gutenberg_id: 174,
        title: 'The Picture of Dorian Gray',
        author: 'Oscar Wilde',
        category: 'classic',
        contentType: 'novel',
        description: 'A young man sells his soul for eternal youth and beauty, while his portrait ages and reflects his moral corruption.',
        estimatedWordCount: 78000,
        genre: 'Gothic Fiction',
        yearPublished: 1890
    },
    {
        gutenberg_id: 844,
        title: 'The Importance of Being Earnest',
        author: 'Oscar Wilde',
        category: 'classic',
        contentType: 'play',
        description: 'A farcical comedy satirizing Victorian social norms and the concept of earnestness.',
        estimatedWordCount: 20000,
        genre: 'Comedy',
        yearPublished: 1895
    },

    // Mary Shelley
    {
        gutenberg_id: 84,
        title: 'Frankenstein',
        author: 'Mary Shelley',
        category: 'classic',
        contentType: 'novel',
        description: 'A scientist creates a sapient creature in an unorthodox experiment, with tragic consequences.',
        estimatedWordCount: 75000,
        genre: 'Gothic Fiction',
        yearPublished: 1818
    },

    // Emily Brontë
    {
        gutenberg_id: 768,
        title: 'Wuthering Heights',
        author: 'Emily Brontë',
        category: 'classic',
        contentType: 'novel',
        description: 'A tale of passion and revenge set on the Yorkshire moors, centered on the turbulent relationship between Catherine and Heathcliff.',
        estimatedWordCount: 107000,
        genre: 'Gothic Fiction',
        yearPublished: 1847
    },

    // Charlotte Brontë
    {
        gutenberg_id: 1260,
        title: 'Jane Eyre',
        author: 'Charlotte Brontë',
        category: 'classic',
        contentType: 'novel',
        description: 'The coming-of-age story of an orphaned governess who faces hardship, finds love, and maintains her integrity.',
        estimatedWordCount: 183000,
        genre: 'Romance',
        yearPublished: 1847
    },

    // Herman Melville
    {
        gutenberg_id: 2701,
        title: 'Moby-Dick',
        author: 'Herman Melville',
        category: 'classic',
        contentType: 'novel',
        description: 'Captain Ahab\'s obsessive quest to hunt down the white whale that destroyed his ship and took his leg.',
        estimatedWordCount: 212000,
        genre: 'Adventure',
        yearPublished: 1851
    },

    // Nathaniel Hawthorne
    {
        gutenberg_id: 25344,
        title: 'The Scarlet Letter',
        author: 'Nathaniel Hawthorne',
        category: 'classic',
        contentType: 'novel',
        description: 'Set in Puritan Boston, a woman is condemned to wear a scarlet "A" for adultery.',
        estimatedWordCount: 63000,
        genre: 'Historical Fiction',
        yearPublished: 1850
    },

    // Leo Tolstoy
    {
        gutenberg_id: 1399,
        title: 'Anna Karenina',
        author: 'Leo Tolstoy',
        category: 'classic',
        contentType: 'novel',
        description: 'The tragic story of a married aristocrat who falls into a destructive affair with a dashing cavalry officer.',
        estimatedWordCount: 349000,
        genre: 'Literary Fiction',
        yearPublished: 1878
    },
    {
        gutenberg_id: 2600,
        title: 'War and Peace',
        author: 'Leo Tolstoy',
        category: 'classic',
        contentType: 'novel',
        description: 'An epic tale of Russian society during the Napoleonic Wars, chronicling the lives of five aristocratic families.',
        estimatedWordCount: 587000,
        genre: 'Historical Fiction',
        yearPublished: 1869
    },

    // Fyodor Dostoevsky
    {
        gutenberg_id: 2554,
        title: 'Crime and Punishment',
        author: 'Fyodor Dostoevsky',
        category: 'classic',
        contentType: 'novel',
        description: 'A poor student commits murder and grapples with the psychological and moral consequences.',
        estimatedWordCount: 211000,
        genre: 'Psychological Fiction',
        yearPublished: 1866
    },
    {
        gutenberg_id: 28054,
        title: 'The Brothers Karamazov',
        author: 'Fyodor Dostoevsky',
        category: 'classic',
        contentType: 'novel',
        description: 'A philosophical novel exploring faith, doubt, reason, and morality through the story of three brothers.',
        estimatedWordCount: 364000,
        genre: 'Philosophical Fiction',
        yearPublished: 1880
    },

    // Victor Hugo
    {
        gutenberg_id: 135,
        title: 'Les Misérables',
        author: 'Victor Hugo',
        category: 'classic',
        contentType: 'novel',
        description: 'An epic tale of justice, redemption, and revolution in 19th-century France.',
        estimatedWordCount: 536000,
        genre: 'Historical Fiction',
        yearPublished: 1862
    },

    // Alexandre Dumas
    {
        gutenberg_id: 1184,
        title: 'The Count of Monte Cristo',
        author: 'Alexandre Dumas',
        category: 'classic',
        contentType: 'novel',
        description: 'A tale of revenge, betrayal, and redemption as Edmond Dantès escapes prison and plots against those who wronged him.',
        estimatedWordCount: 464000,
        genre: 'Adventure',
        yearPublished: 1844
    },
    {
        gutenberg_id: 1257,
        title: 'The Three Musketeers',
        author: 'Alexandre Dumas',
        category: 'classic',
        contentType: 'novel',
        description: 'The adventures of d\'Artagnan and his three musketeer friends during the reign of Louis XIII.',
        estimatedWordCount: 257000,
        genre: 'Adventure',
        yearPublished: 1844
    },

    // Edgar Allan Poe
    {
        gutenberg_id: 2147,
        title: 'The Raven',
        author: 'Edgar Allan Poe',
        category: 'classic',
        contentType: 'poem',
        description: 'A narrative poem about a distraught lover visited by a mysterious raven.',
        estimatedWordCount: 1100,
        genre: 'Poetry',
        yearPublished: 1845
    },
    {
        gutenberg_id: 932,
        title: 'The Fall of the House of Usher',
        author: 'Edgar Allan Poe',
        category: 'classic',
        contentType: 'novel',
        description: 'A Gothic horror story about a narrator visiting his friend in a gloomy mansion.',
        estimatedWordCount: 6000,
        genre: 'Horror',
        yearPublished: 1839
    },

    // H.G. Wells
    {
        gutenberg_id: 35,
        title: 'The Time Machine',
        author: 'H.G. Wells',
        category: 'classic',
        contentType: 'novel',
        description: 'A scientist travels far into the future and discovers the fate of humanity.',
        estimatedWordCount: 32000,
        genre: 'Science Fiction',
        yearPublished: 1895
    },
    {
        gutenberg_id: 36,
        title: 'The War of the Worlds',
        author: 'H.G. Wells',
        category: 'classic',
        contentType: 'novel',
        description: 'Martians invade Earth in this groundbreaking science fiction novel.',
        estimatedWordCount: 59000,
        genre: 'Science Fiction',
        yearPublished: 1898
    },

    // Jules Verne
    {
        gutenberg_id: 103,
        title: 'Around the World in Eighty Days',
        author: 'Jules Verne',
        category: 'classic',
        contentType: 'novel',
        description: 'Phileas Fogg attempts to circumnavigate the globe in 80 days on a wager.',
        estimatedWordCount: 65000,
        genre: 'Adventure',
        yearPublished: 1873
    },
    {
        gutenberg_id: 164,
        title: 'Twenty Thousand Leagues Under the Sea',
        author: 'Jules Verne',
        category: 'classic',
        contentType: 'novel',
        description: 'An underwater adventure aboard the mysterious submarine Nautilus.',
        estimatedWordCount: 108000,
        genre: 'Adventure',
        yearPublished: 1870
    },

    // Lewis Carroll
    {
        gutenberg_id: 11,
        title: 'Alice\'s Adventures in Wonderland',
        author: 'Lewis Carroll',
        category: 'classic',
        contentType: 'novel',
        description: 'Alice falls down a rabbit hole into a fantasy world populated by peculiar creatures.',
        estimatedWordCount: 26000,
        genre: 'Fantasy',
        yearPublished: 1865
    },
    {
        gutenberg_id: 12,
        title: 'Through the Looking-Glass',
        author: 'Lewis Carroll',
        category: 'classic',
        contentType: 'novel',
        description: 'Alice steps through a mirror into an alternative world in this sequel to Alice in Wonderland.',
        estimatedWordCount: 30000,
        genre: 'Fantasy',
        yearPublished: 1871
    },

    // Robert Louis Stevenson
    {
        gutenberg_id: 42,
        title: 'The Strange Case of Dr. Jekyll and Mr. Hyde',
        author: 'Robert Louis Stevenson',
        category: 'classic',
        contentType: 'novel',
        description: 'A London lawyer investigates the connection between his friend Dr. Jekyll and the evil Mr. Hyde.',
        estimatedWordCount: 25000,
        genre: 'Gothic Fiction',
        yearPublished: 1886
    },
    {
        gutenberg_id: 120,
        title: 'Treasure Island',
        author: 'Robert Louis Stevenson',
        category: 'classic',
        contentType: 'novel',
        description: 'Young Jim Hawkins embarks on a treasure hunt that becomes a battle with pirates.',
        estimatedWordCount: 67000,
        genre: 'Adventure',
        yearPublished: 1883
    },

    // Louisa May Alcott
    {
        gutenberg_id: 514,
        title: 'Little Women',
        author: 'Louisa May Alcott',
        category: 'classic',
        contentType: 'novel',
        description: 'The lives and loves of four sisters growing up during the American Civil War.',
        estimatedWordCount: 189000,
        genre: 'Coming-of-age',
        yearPublished: 1868
    },

    // Bram Stoker
    {
        gutenberg_id: 345,
        title: 'Dracula',
        author: 'Bram Stoker',
        category: 'classic',
        contentType: 'novel',
        description: 'The quintessential vampire tale following Count Dracula\'s attempt to move to England.',
        estimatedWordCount: 164000,
        genre: 'Horror',
        yearPublished: 1897
    },

    // L. Frank Baum
    {
        gutenberg_id: 55,
        title: 'The Wonderful Wizard of Oz',
        author: 'L. Frank Baum',
        category: 'classic',
        contentType: 'novel',
        description: 'Dorothy is whisked away to the magical Land of Oz and must find her way home.',
        estimatedWordCount: 42000,
        genre: 'Fantasy',
        yearPublished: 1900
    },

    // Arthur Conan Doyle
    {
        gutenberg_id: 1661,
        title: 'The Adventures of Sherlock Holmes',
        author: 'Arthur Conan Doyle',
        category: 'classic',
        contentType: 'novel',
        description: 'A collection of twelve detective stories featuring the brilliant Sherlock Holmes.',
        estimatedWordCount: 109000,
        genre: 'Mystery',
        yearPublished: 1892
    },
    {
        gutenberg_id: 2097,
        title: 'The Hound of the Baskervilles',
        author: 'Arthur Conan Doyle',
        category: 'classic',
        contentType: 'novel',
        description: 'Sherlock Holmes investigates a deadly curse haunting the Baskerville family.',
        estimatedWordCount: 59000,
        genre: 'Mystery',
        yearPublished: 1902
    },

    // Jack London
    {
        gutenberg_id: 215,
        title: 'The Call of the Wild',
        author: 'Jack London',
        category: 'classic',
        contentType: 'novel',
        description: 'A domesticated dog named Buck is thrust into the wilds of the Yukon during the Gold Rush.',
        estimatedWordCount: 31000,
        genre: 'Adventure',
        yearPublished: 1903
    },
    {
        gutenberg_id: 910,
        title: 'White Fang',
        author: 'Jack London',
        category: 'classic',
        contentType: 'novel',
        description: 'The story of a wild wolfdog\'s journey to domestication in the frozen Yukon.',
        estimatedWordCount: 72000,
        genre: 'Adventure',
        yearPublished: 1906
    },

    // Dante Alighieri
    {
        gutenberg_id: 1004,
        title: 'The Divine Comedy',
        author: 'Dante Alighieri',
        category: 'classic',
        contentType: 'poem',
        description: 'An epic poem describing Dante\'s journey through Hell, Purgatory, and Paradise.',
        estimatedWordCount: 94000,
        genre: 'Poetry',
        yearPublished: 1320
    },

    // Homer
    {
        gutenberg_id: 1727,
        title: 'The Odyssey',
        author: 'Homer',
        category: 'classic',
        contentType: 'poem',
        description: 'The epic tale of Odysseus\'s ten-year journey home after the Trojan War.',
        estimatedWordCount: 115000,
        genre: 'Epic Poetry',
        yearPublished: -800
    },
    {
        gutenberg_id: 6130,
        title: 'The Iliad',
        author: 'Homer',
        category: 'classic',
        contentType: 'poem',
        description: 'An ancient Greek epic about the Trojan War and the wrath of Achilles.',
        estimatedWordCount: 145000,
        genre: 'Epic Poetry',
        yearPublished: -800
    },

    // Virginia Woolf
    {
        gutenberg_id: 2542,
        title: 'Mrs. Dalloway',
        author: 'Virginia Woolf',
        category: 'classic',
        contentType: 'novel',
        description: 'A day in the life of Clarissa Dalloway as she prepares for a party in post-WWI England.',
        estimatedWordCount: 64000,
        genre: 'Modernist',
        yearPublished: 1925
    },

    // James Joyce
    {
        gutenberg_id: 2814,
        title: 'Dubliners',
        author: 'James Joyce',
        category: 'classic',
        contentType: 'novel',
        description: 'A collection of fifteen short stories depicting middle-class life in Dublin.',
        estimatedWordCount: 67000,
        genre: 'Modernist',
        yearPublished: 1914
    },

    // Franz Kafka
    {
        gutenberg_id: 5200,
        title: 'Metamorphosis',
        author: 'Franz Kafka',
        category: 'classic',
        contentType: 'novel',
        description: 'Gregor Samsa wakes up one morning to find himself transformed into a giant insect.',
        estimatedWordCount: 22000,
        genre: 'Absurdist Fiction',
        yearPublished: 1915
    }
];
