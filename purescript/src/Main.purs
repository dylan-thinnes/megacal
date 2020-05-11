module Main where

import Prelude

import Data.Foldable (and, null)
import Data.Maybe (Maybe(..))
import Data.Enum
import Data.Array ((..), cons, take, drop)
import Data.Symbol
import Data.Const (Const)
import Effect (Effect)
import Effect.Aff (Aff)
import Halogen as H
import Halogen.Aff (awaitBody, runHalogenAff)
import Halogen.HTML as HH
import Halogen.VDom.Driver (runUI)
import Data.String.Common (split)
import Data.String.Pattern (Pattern(..))

main :: Effect Unit
main = runHalogenAff $ do
    body <- awaitBody
    runUI component unit body

component :: forall m. H.Component HH.HTML (Const Void) Unit Void m
component = H.mkComponent
    { initialState: const unit
    , render: render
    , eval: H.mkEval H.defaultEval
    }
    where

    render :: Unit -> H.ComponentHTML Void () m
    render _ = HH.div_ $ map year (2000 .. 2099)

    year :: Int -> H.ComponentHTML Void () m
    year yyyy
      = HH.div_ $ (map HH.text $ split (Pattern "") $ show yyyy)
               <> (map (month yyyy) (1..12))

    daysOfMonth :: Int -> Int -> Int
    daysOfMonth yyyy mm = daysOf mm + (if isLeap then 1 else 0)
        where
        isLeap :: Boolean
        isLeap = and [ mm == 2
                     , yyyy `mod` 4 == 0
                     , yyyy `mod` 100 /= 0 || yyyy `mod` 400 == 0
                     ]
        daysOf :: Int -> Int
        daysOf  1 = 31
        daysOf  2 = 28
        daysOf  3 = 31
        daysOf  4 = 30
        daysOf  5 = 31
        daysOf  6 = 30
        daysOf  7 = 31
        daysOf  8 = 31
        daysOf  9 = 30
        daysOf 10 = 31
        daysOf 11 = 30
        daysOf 12 = 31
        daysOf _  = 0

    chunksOf :: forall a. Int -> Array a -> Array (Array a)
    chunksOf n arr | null arr  = []
                   | otherwise = cons (take n arr) (chunksOf n $ drop n arr)

    month :: Int -> Int -> H.ComponentHTML Void () m
    month yyyy mm
      = HH.div_ $ (map HH.text $ split (Pattern "") $ show mm)
               <> (map week $ chunksOf 7 (1..daysOfMonth yyyy mm))

    week :: Array Int -> H.ComponentHTML Void () m
    week days = HH.div_ $ map day days

    day :: Int -> H.ComponentHTML Void () m
    day dd = HH.div_ [HH.text $ show dd]

