USE scores;


CREATE TABLE points

(
  userId varchar(19) NOT NULL,
  username text NOT NULL,
  points int unsigned, 
  level int unsigned,
  November_2017 int unsigned,
  December_2017 int unsigned,
  PRIMARY KEY     (userId)
)
CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE TABLE links

( 
  userId varchar(19) NOT NULL,
  username text NOT NULL, 
  twitch varchar(255),
  youtube varchar(255),
  steam varchar(255)
)
CHARACTER SET utf8 COLLATE utf8_general_ci;