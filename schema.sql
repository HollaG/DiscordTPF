CREATE DATABASE IF NOT EXISTS scores;

USE scores;


CREATE TABLE IF NOT EXISTS points

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

CREATE TABLE IF NOT EXISTS links

( 
  userId varchar(19) NOT NULL,
  username text NOT NULL, 
  twitch varchar(255),
  youtube varchar(255),
  steam varchar(255)
)
CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE DATABASE IF NOT EXISTS suggestList;

USE suggestList;

CREATE TABLE IF NOT EXISTS suggestions

( 
  ID int NOT NULL AUTO_INCREMENT,
  userId varchar(19) NOT NULL,
  username varchar(255) NOT NULL,
  suggestion LONGTEXT, 
  requesteeID varchar(19), 
  requesteeName varchar(255),
  state varchar(255),
  accepter varchar(255),
  PRIMARY KEY (ID)
)
CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE DATABASE IF NOT EXISTS workshop
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE workshop;

CREATE TABLE IF NOT EXISTS steam_workshop

( 
  ID int NOT NULL AUTO_INCREMENT,
  fileID varchar(50) NOT NULL,
  fileName varchar(255) NOT NULL,
  creatorID varchar(50) NOT NULL,
  creatorName varchar(255),
  PRIMARY KEY (ID) 
)
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS serverInfo
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE information
CREATE TABLE IF NOT EXISTS dailyInfo

( 
  Date TEXT,
  NumberOfUsersYesterday INTEGER,
  NumberOfUsersToday INTEGER,
  NetUserChange INTEGER,
  TotalMessagesSent INTEGER,
  MostActiveChannel varchar(100),
  MostActiveUser varchar(100)
)
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;